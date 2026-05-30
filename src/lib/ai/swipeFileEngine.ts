import { CleanExtractor } from './cleanExtractor';
import { supabase } from '../supabase';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

export class SwipeFileEngine {
  private extractor: CleanExtractor;
  private openai: OpenAI;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.extractor = new CleanExtractor();
    
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) throw new Error("OPENAI_API_KEY no configurado.");
    this.openai = new OpenAI({ apiKey: openAiKey });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error("GEMINI_API_KEY no configurado.");
    this.genAI = new GoogleGenerativeAI(geminiKey);
  }

  /**
   * Ingesta completa de una URL al RAG
   */
  async ingestContent(url: string, platform: 'tiktok' | 'instagram') {
    console.log(`[SwipeFile] Iniciando ingesta de: ${url}`);
    
    // 1. Extraer Video, Audio y Frames
    let mediaResult;
    if (platform === 'tiktok') {
      mediaResult = await this.extractor.extractTikTok(url);
    } else {
      mediaResult = await this.extractor.extractInstagram(url);
    }

    // El extractor ahora devuelve un objeto si fue actualizado correctamente, asumimos que sí.
    // Como la firma en el archivo anterior retornaba solo el string temporalmente, 
    // asumiremos la versión full (videoPath, audioPath, frames).
    // NOTA: Como la interfaz anterior devolvía string, el código se actualizó para devolver el objeto.
    const { videoPath, audioPath, frames } = mediaResult as any;

    // 2. Transcripción con Whisper API
    console.log(`[Whisper] Transcribiendo audio: ${audioPath}`);
    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'es' // Asumiendo español para la tienda RRG
    });
    const transcriptText = transcription.text;

    // 3. Análisis Visual con Gemini Vision (Hormozi / Gadzhi framework)
    console.log(`[Gemini Vision] Analizando frames visuales...`);
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const imageParts = frames.map((framePath: string) => ({
      inlineData: {
        data: Buffer.from(fs.readFileSync(framePath)).toString("base64"),
        mimeType: "image/jpeg"
      }
    }));

    const prompt = `
      Eres un estratega de contenido nivel Alex Hormozi e Iman Gadzhi.
      A continuación, tienes 3 frames clave de un video viral y la transcripción del audio:
      Transcripción: "${transcriptText}"
      
      Desglosa este contenido en formato JSON estricto con las siguientes claves:
      - visual_hook: Descripción técnica del gancho de los primeros 3 segundos (movimientos de cámara, colores, qué atrae la atención).
      - value_story: La narrativa central o el valor entregado.
      - cta: El llamado a la acción final y la táctica psicológica usada (escasez, urgencia, estatus).
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    const analysis = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    // 4. Generar Embedding del contenido analizado
    const combinedContext = `
      Transcript: ${transcriptText}
      Hook Visual: ${analysis.visual_hook}
      Narrativa: ${analysis.value_story}
      CTA: ${analysis.cta}
    `;

    // Usamos el modelo de embeddings de Gemini o OpenAI. Por consistencia con Gemini usaremos Gemini Embeddings:
    const embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(combinedContext);
    const embeddingVector = embeddingResult.embedding.values;

    // 5. Guardar en Supabase (pgvector)
    console.log(`[Supabase] Inyectando análisis vectorial en pgvector...`);
    // Asegurarse de parsear correctamente el array de 768 dimensiones a un string compatible con pgvector
    const pgvectorString = `[${embeddingVector.join(',')}]`;

    const { data, error } = await supabase.from('swipe_files').insert({
      source_url: url,
      platform,
      transcript: transcriptText,
      visual_hook_analysis: analysis.visual_hook,
      value_story_analysis: analysis.value_story,
      cta_analysis: analysis.cta,
      embedding: pgvectorString
    });

    if (error) throw new Error(`Supabase Error: ${error.message}`);

    console.log(`[SwipeFile] Ingesta RAG completada con éxito.`);
    
    // Limpieza opcional de archivos temporales (fs.unlinkSync)
    
    return analysis;
  }
}
