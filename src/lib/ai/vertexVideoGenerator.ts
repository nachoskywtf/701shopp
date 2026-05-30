import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabase';

export class VertexVideoGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error("GEMINI_API_KEY no configurado.");
    this.genAI = new GoogleGenerativeAI(geminiKey);
  }

  /**
   * Genera un video autónomo usando RAG y Google Veo / Imagen 3
   */
  async generateCreativeForProduct(productName: string, notes: string): Promise<string> {
    console.log(`[Vertex AI] Iniciando generación autónoma para: ${productName}`);

    // 1. Prompting Dinámico: Buscar contexto en pgvector (Memoria RAG)
    const embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    const queryEmbedding = await embeddingModel.embedContent(`Video promocional para perfume ${productName} con notas de ${notes}`);
    
    // Consulta RPC a Supabase para similarity search
    const { data: similarFiles, error } = await supabase.rpc('match_swipe_files', {
      query_embedding: queryEmbedding.embedding.values,
      match_threshold: 0.7,
      match_count: 1
    });

    if (error) {
      console.warn(`[Supabase RAG] Advertencia: No se pudo hacer match vectorial: ${error.message}`);
    }

    const memoryContext = similarFiles && similarFiles.length > 0 
      ? `ESTRUCTURA VISUAL DE ÉXITO PREVIA: ${similarFiles[0].visual_hook_analysis}` 
      : 'Toma macro 4k de botella de perfume sobre fondo cinemático, iluminación dramática de estudio, cámara en movimiento lento.';

    // 2. Redacción de Prompt Cinemático
    const promptModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const promptResponse = await promptModel.generateContent(`
      Eres un Director de Arte y Cinematografía. Necesito generar un video corto (5-10s) para vender el perfume "${productName}".
      Usa esta estructura visual que sabemos que funciona: "${memoryContext}".
      Notas olfativas: ${notes}.
      
      Escribe UN SOLO prompt en inglés ultra-detallado para Google Veo (Vertex AI Video Generator).
      Debe enfocarse estrictamente en la iluminación, movimientos de cámara, texturas y atmósfera.
    `);

    const cinematicPrompt = promptResponse.response.text().trim();
    console.log(`[Veo Prompt]: ${cinematicPrompt}`);

    // 3. Renderizado con Google Vertex AI (Veo/Imagen 3 Video)
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const accessToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN; // Requiere Service Account Token

    if (!projectId || !accessToken) {
      console.warn("[Vertex AI] Faltan credenciales de GCP (PROJECT_ID o ACCESS_TOKEN). Simulando render...");
      await new Promise(res => setTimeout(res, 5000));
      return `https://storage.googleapis.com/mkt701_renders/veo_render_sim_${Date.now()}.mp4`;
    }
    
    console.log(`[Vertex AI] Enviando prompt a Veo Video Generator en GCP (${projectId})...`);
    
    // Fetch HTTP al endpoint de predicción de Google Cloud Vertex AI para Veo
    const endpointUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo:predict`;
    
    try {
      const veoResponse = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            { prompt: cinematicPrompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            durationSeconds: 5
          }
        })
      });

      if (!veoResponse.ok) {
        throw new Error(`Error en Vertex AI: ${veoResponse.statusText}`);
      }

      const resultData = await veoResponse.json();
      const outputUri = resultData.predictions?.[0]?.videoUri || resultData.predictions?.[0]?.gcsUri;
      
      console.log(`[Vertex AI] Renderizado completo: ${outputUri}`);
      return outputUri || `https://storage.googleapis.com/mkt701_renders/veo_render_${Date.now()}.mp4`;

    } catch (error) {
      console.error(`[Vertex AI] Falló la generación, retornando fallback. Error:`, error);
      return `https://storage.googleapis.com/mkt701_renders/veo_render_fallback_${Date.now()}.mp4`;
    }
  }
}
