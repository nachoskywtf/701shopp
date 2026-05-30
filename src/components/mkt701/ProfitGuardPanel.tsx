import React, { useState } from 'react';
import { ShieldAlert, TrendingDown, DollarSign, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ProfitGuardPanel() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handlePanicButton = () => {
    setIsAuditing(true);
    setAuditResult(null);

    // Simular el proceso de auditoría y exclusión dinámica
    setTimeout(() => {
      setIsAuditing(false);
      setAuditResult({
        status: 'PROTECTED',
        excludedRegions: ['Punta Arenas (Magallanes)', 'Arica y Parinacota'],
        netMargin: '22.5%',
        message: 'Zonas rojas excluidas. Margen neto asegurado.'
      });
    }, 2500);
  };

  return (
    <div className="p-5 border border-yellow-900/50 bg-[#1a1500] rounded-lg relative overflow-hidden flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-yellow-500 font-bold font-mono mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> PROFIT GUARD & AI-CFO
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Auditoría en vivo de márgenes netos. Exclusión geográfica automática en zonas de pérdida (Costo de envío &gt; Margen).
          </p>
        </div>
        
        {/* LTV & Margin Quick Stats */}
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Margen Neto Real</span>
            <span className="text-lg font-bold text-green-400 flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> 22.5%
            </span>
          </div>
          <div className="flex flex-col items-end border-l border-yellow-900/30 pl-4">
            <span className="text-[10px] text-gray-500 font-mono uppercase">LTV (Proyectado)</span>
            <span className="text-lg font-bold text-yellow-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> $120k
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-black/40 border border-yellow-900/30 rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-mono text-gray-300">Monitoreo de Regiones</span>
          <span className="text-xs font-mono text-yellow-500 animate-pulse flex items-center gap-1">
            <Activity className="w-3 h-3" /> ANALIZANDO
          </span>
        </div>
        
        {/* Botón de Pánico */}
        {!auditResult ? (
          <button 
            onClick={handlePanicButton}
            disabled={isAuditing}
            className="w-full py-3 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-500 font-bold tracking-widest rounded text-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isAuditing ? <Activity className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
            {isAuditing ? 'AUDITANDO MÁRGENES...' : 'ACTIVAR EXCLUSIÓN DINÁMICA (PANIC BUTTON)'}
          </button>
        ) : (
          <div className="w-full py-3 bg-green-900/20 border border-green-500/30 text-green-400 font-bold rounded flex items-center justify-between px-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{auditResult.message}</span>
            </div>
            <span className="text-xs opacity-75 font-mono">Excluidas: {auditResult.excludedRegions.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
