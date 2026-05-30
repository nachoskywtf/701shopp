import React, { useState } from 'react';
import { Database, DownloadCloud, Activity } from 'lucide-react';

export function SwipeFilePanel() {
  const [url, setUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleIngest = async () => {
    if (!url) return;
    setIsIngesting(true);
    setStatusText('Extrayendo multimedia con Apify...');
    
    // Simulating the ingestion flow for UI UX
    setTimeout(() => {
      setStatusText('Transcribiendo con Whisper y Analizando con Gemini Vision...');
      setTimeout(() => {
        setStatusText('Inyectando vector (768D) en Supabase pgvector...');
        setTimeout(() => {
          setIsIngesting(false);
          setStatusText('Ingesta completada. Memoria RAG actualizada.');
          setUrl('');
        }, 2000);
      }, 3000);
    }, 2500);
  };

  return (
    <div className="p-5 border border-green-900/50 bg-[#001405] rounded-lg relative overflow-hidden flex flex-col gap-3">
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
      <h3 className="text-green-500 font-bold font-mono flex items-center gap-2">
        <Database className="w-4 h-4" /> THE SWIPE FILE RAG (MOD 9 & 10)
      </h3>
      <p className="text-sm text-gray-400 mb-2">
        Ingesta de TikTok/IG. Análisis multimodal con Gemini 1.5 Pro y memoria pgvector.
      </p>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://tiktok.com/@user/video/123..." 
          className="flex-1 bg-black border border-green-900 text-green-400 text-sm p-2 rounded focus:outline-none focus:border-green-500 font-mono placeholder-green-900/50"
          disabled={isIngesting}
        />
        <button 
          onClick={handleIngest}
          disabled={isIngesting || !url}
          className="px-4 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 font-bold rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isIngesting ? <Activity className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
          INGESTAR
        </button>
      </div>

      {statusText && (
        <div className="mt-2 text-xs font-mono text-green-500 animate-pulse">
          {'>'} {statusText}
        </div>
      )}
    </div>
  );
}
