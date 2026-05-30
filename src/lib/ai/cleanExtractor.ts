import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const MEDIA_DIR = path.join(os.tmpdir(), 'mkt701_media');

// Asegurar que el directorio existe
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

/**
 * Función de Retry con Exponential Backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      const err = error as AxiosError;
      const status = err.response?.status;
      
      // Solo reintentamos si es error de rate limit (429) o forbiden/bloqueo temporal (403)
      if (status !== undefined && (status === 429 || status === 403 || status >= 500)) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[RETRY] Intento ${attempt} fallido (Status: ${status}). Esperando ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Unreachable");
}

export class CleanExtractor {
  
  /**
   * Extrae TikTok sin marca de agua usando Apify.
   */
  async extractTikTok(url: string): Promise<{videoPath: string, audioPath: string, frames: string[]}> {
    const apifyToken = process.env.VITE_APIFY_TOKEN;
    if (!apifyToken) throw new Error("VITE_APIFY_TOKEN no configurado.");

    console.log(`[TikTok] Obteniendo video limpio mediante Apify para evadir bloqueos: ${url}`);
    
    // Llamada a la API de Apify ejecutando el actor de TikTok Scraper
    const runResponse = await withRetry(() => axios.post(
      `https://api.apify.com/v2/acts/apify~tiktok-scraper/runs?token=${apifyToken}`,
      { postURLs: [url], resultsPerPage: 1 }
    ));

    const runId = runResponse.data.data.id;
    let status = 'RUNNING';
    let datasetId = runResponse.data.data.defaultDatasetId;

    // Polling hasta que el actor de Apify termine
    while (status !== 'SUCCEEDED' && status !== 'FAILED') {
      await new Promise(res => setTimeout(res, 5000));
      const statusRes = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
      status = statusRes.data.data.status;
      if (status === 'FAILED') throw new Error("Apify actor falló al procesar el TikTok.");
    }

    const datasetRes = await axios.get(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    const videoUrl = datasetRes.data[0]?.videoMeta?.downloadAddr || datasetRes.data[0]?.videoUrl;
    
    if (!videoUrl) throw new Error("No se pudo extraer el videoUrl del TikTok desde Apify.");

    return await this.downloadMedia(videoUrl, `tiktok_${Date.now()}.mp4`);
  }

  /**
   * Extrae Instagram Reels usando Apify para evadir bloqueos de Meta.
   */
  async extractInstagram(url: string): Promise<{videoPath: string, audioPath: string, frames: string[]}> {
    const apifyToken = process.env.VITE_APIFY_TOKEN;
    if (!apifyToken) throw new Error("VITE_APIFY_TOKEN no configurado.");

    console.log(`[Instagram] Obteniendo Reel mediante Apify para evadir bloqueos: ${url}`);
    
    // Llamada a la API de Apify ejecutando el actor de Instagram Scraper
    // Se usa un actor genérico de ejemplo (el ID dependerá del suscrito en Apify)
    const runResponse = await withRetry(() => axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apifyToken}`,
      { directUrls: [url] }
    ));

    const runId = runResponse.data.data.id;
    let status = 'RUNNING';
    let datasetId = runResponse.data.data.defaultDatasetId;

    // Polling hasta que el actor de Apify termine
    while (status !== 'SUCCEEDED' && status !== 'FAILED') {
      await new Promise(res => setTimeout(res, 5000));
      const statusRes = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
      status = statusRes.data.data.status;
      if (status === 'FAILED') throw new Error("Apify actor falló al procesar el Reel.");
    }

    const datasetRes = await axios.get(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    const videoUrl = datasetRes.data[0]?.videoUrl;
    
    if (!videoUrl) throw new Error("No se pudo extraer el videoUrl del Reel.");

    return await this.downloadMedia(videoUrl, `ig_${Date.now()}.mp4`);
  }

  /**
   * Descarga el archivo a disco y aplica FFmpeg para separar audio y frames.
   */
  private async downloadMedia(url: string, filename: string): Promise<{
    videoPath: string,
    audioPath: string,
    frames: string[]
  }> {
    const videoPath = path.join(MEDIA_DIR, filename);
    const audioPath = videoPath.replace('.mp4', '.mp3');
    
    // 1. Descargar crudo
    const response = await axios({ url, responseType: 'stream' });
    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(undefined));
      writer.on('error', reject);
    });

    console.log(`[Media] Video guardado en: ${videoPath}`);

    // 2. Procesar con FFmpeg (Extraer Audio y Frames)
    return new Promise((resolve, reject) => {
      let frames: string[] = [];
      
      ffmpeg(videoPath)
        // Extraer audio en .mp3 (para Whisper)
        .output(audioPath)
        .noVideo()
        .audioCodec('libmp3lame')
        // Extraer 3 frames clave (para Gemini Vision)
        .on('filenames', (filenames) => {
          frames = filenames.map((f: string) => path.join(MEDIA_DIR, f));
        })
        .on('end', () => {
          console.log(`[FFmpeg] Procesamiento completo. Frames y Audio extraídos.`);
          resolve({ videoPath, audioPath, frames });
        })
        .on('error', (err) => {
          console.error(`[FFmpeg] Error:`, err);
          reject(err);
        })
        .screenshots({
          count: 3,
          folder: MEDIA_DIR,
          filename: `${filename.replace('.mp4', '')}_frame_%i.jpg`,
          size: '1280x720'
        });
    });
  }
}
