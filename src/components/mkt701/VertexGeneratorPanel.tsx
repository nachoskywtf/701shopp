import React, { useState } from 'react';
import { Video, Zap, PlayCircle } from 'lucide-react';

export function VertexGeneratorPanel() {
  const [product, setProduct] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [statusText, setStatusText] = useState('');

  const handleGenerate = async () => {
    if (!product || !notes) return;
    setIsGenerating(true);
    setVideoUrl('');
    setStatusText('Consultando Memoria RAG (pgvector)...');
    
    // Simulating the Video Generation UX
    setTimeout(() => {
      setStatusText('Redactando prompt cinemático con Gemini 1.5 Pro...');
      setTimeout(() => {
        setStatusText('Renderizando en GCP Vertex AI (Veo Video Generator)...');
        setTimeout(() => {
          setIsGenerating(false);
          setStatusText('');
          setVideoUrl(`https://storage.googleapis.com/mkt701_renders/veo_render_sim_${Date.now()}.mp4`);
        }, 4000);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-5 border border-purple-900/50 bg-[#12001a] rounded-lg relative overflow-hidden flex flex-col gap-3">
      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
      <h3 className="text-purple-400 font-bold font-mono flex items-center gap-2">
        <Video className="w-4 h-4" /> VERTEX AI GENERATOR (MOD 11)
      </h3>
      <p className="text-sm text-gray-400 mb-2">
        Generador autónomo de creativos usando memoria RAG y Google Veo.
      </p>
      
      <div className="flex flex-col gap-2">
        <input 
          type="text" 
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Nombre del Perfume (ej. Acqua di Gio)" 
          className="w-full bg-black border border-purple-900 text-purple-400 text-sm p-2 rounded focus:outline-none focus:border-purple-500 font-mono placeholder-purple-900/50"
          disabled={isGenerating}
        />
        <input 
          type="text" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas olfativas (ej. Cítrico, Acuático, Fresco)" 
          className="w-full bg-black border border-purple-900 text-purple-400 text-sm p-2 rounded focus:outline-none focus:border-purple-500 font-mono placeholder-purple-900/50"
          disabled={isGenerating}
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !product || !notes}
          className="w-full mt-2 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 font-bold rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? <Zap className="w-4 h-4 animate-pulse" /> : <PlayCircle className="w-4 h-4" />}
          {isGenerating ? 'GENERANDO CREATIVO 4K...' : 'RENDERIZAR VIDEO'}
        </button>
      </div>

      {statusText && (
        <div className="mt-2 text-xs font-mono text-purple-500 animate-pulse">
          {'>'} {statusText}
        </div>
      )}

      {videoUrl && (
        <div className="mt-3 p-3 bg-black border border-purple-900/50 rounded flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 truncate mr-2">{videoUrl}</span>
          <a href={videoUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 text-xs font-bold whitespace-nowrap">VER RESULTADO</a>
        </div>
      )}
    </div>
  );
}
