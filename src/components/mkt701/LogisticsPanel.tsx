import React, { useState, useEffect } from 'react';
import { PackageSearch, Send, CheckSquare, Clock } from 'lucide-react';

export function LogisticsPanel() {
  const [logs, setLogs] = useState<{ id: number, message: string, time: string, type: 'info' | 'success' | 'alert' }[]>([
    { id: 1, message: "Sistema Logístico Iniciado. Conectado a API BlueExpress.", time: new Date().toLocaleTimeString(), type: 'info' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateOrderFlow = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const now = () => new Date().toLocaleTimeString();
    
    setTimeout(() => {
      setLogs(prev => [{ id: Date.now(), message: "[COMPRA] Nuevo pago confirmado: Pedido #701-442", time: now(), type: 'success' }, ...prev]);
      
      setTimeout(() => {
        setLogs(prev => [{ id: Date.now(), message: "[COURIER] Generando Etiqueta BlueExpress PDF...", time: now(), type: 'info' }, ...prev]);
        
        setTimeout(() => {
          setLogs(prev => [{ id: Date.now(), message: "[ETIQUETA] Tracking BX9912039CL generado. Solicitando recogida.", time: now(), type: 'success' }, ...prev]);
          
          setTimeout(() => {
            setLogs(prev => [{ id: Date.now(), message: "[SMS] Zero-Fricción: SMS de seguimiento enviado al cliente.", time: now(), type: 'info' }, ...prev]);
            setIsSimulating(false);
          }, 1500);
        }, 1500);
      }, 1000);
    }, 500);
  };

  return (
    <div className="p-5 border border-cyan-900/50 bg-[#00141a] rounded-lg relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-cyan-500 font-bold font-mono flex items-center gap-2">
            <PackageSearch className="w-5 h-5" /> FULFILLMENT & MANYCHAT (MOD 12 y 15)
          </h3>
          <p className="text-sm text-gray-400">Automatización de Courier y Routing de DMs.</p>
        </div>
        <button 
          onClick={simulateOrderFlow}
          disabled={isSimulating}
          className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 font-bold rounded text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> SIMULAR FLUJO
        </button>
      </div>

      {/* Terminal de Logs Logísticos */}
      <div className="flex-1 bg-black/60 border border-cyan-900/30 rounded p-3 font-mono text-xs overflow-y-auto max-h-[200px] flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 items-start border-b border-cyan-900/20 pb-1">
            <span className="text-gray-500 min-w-[65px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {log.time.substring(0,5)}
            </span>
            <span className={`${
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'alert' ? 'text-yellow-400' : 
              'text-cyan-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        {isSimulating && (
          <div className="text-cyan-500/50 animate-pulse flex items-center gap-2">
            <CheckSquare className="w-3 h-3" /> Procesando operaciones en background...
          </div>
        )}
      </div>
    </div>
  );
}
