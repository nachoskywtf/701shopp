import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, ChevronRight } from 'lucide-react';

export function TerminalBox() {
  const [history, setHistory] = useState([
    { sender: 'bot', text: 'MKT701_SYSTEM_INIT v3000' },
    { sender: 'bot', text: 'DÍA 1 PROTOCOLO LISTO. Esperando input de inventario o despliegue Meta Ads.' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setHistory((prev) => [...prev, { sender: 'user', text: input }]);
    
    // Simular respuesta del bot para la Demo (después se conecta al LLM / God Mode)
    setTimeout(() => {
      if (input.toLowerCase().includes('stock')) {
        setHistory((prev) => [...prev, { sender: 'bot', text: 'Entendido. Ingestando al pipeline visual. ¿A qué precio lo venderás?' }]);
      } else {
        setHistory((prev) => [...prev, { sender: 'bot', text: 'Comando recibido. Analizando variables...' }]);
      }
    }, 800);

    setInput('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-black border border-green-900 rounded-lg overflow-hidden font-mono shadow-[0_0_15px_rgba(0,255,0,0.1)]">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-green-950 border-b border-green-900">
        <Terminal className="w-4 h-4 text-green-500 mr-2" />
        <span className="text-green-500 text-xs tracking-widest font-bold">/MKT701 CONSOLE</span>
      </div>

      {/* Output */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'text-green-400' : 'text-green-600'}`}>
            <span className="mr-2">{msg.sender === 'user' ? '>' : 'MKT701:'}</span>
            <span className="break-words">{msg.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-black border-t border-green-900 flex items-center">
        <ChevronRight className="w-5 h-5 text-green-700 mr-2" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tengo en stock [Perfume] [Ml] tengo [Cantidad]..."
          className="flex-1 bg-transparent text-green-400 outline-none placeholder:text-green-900"
          autoComplete="off"
        />
        <button type="submit" className="p-1 hover:bg-green-900/30 rounded text-green-700 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
