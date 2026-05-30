import React, { useState, useEffect } from 'react';
import { Rocket, Activity, DollarSign, Target, CheckCircle2 } from 'lucide-react';

export function LaunchControlPanel() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Live Metrics state
  const [metrics, setMetrics] = useState({
    roas: 0,
    cpa: 0,
    spend: 0
  });

  // Mock polling effect for live metrics every 15 minutes (using 15s for demo)
  useEffect(() => {
    const fetchMetrics = () => {
      if (launchStatus === 'success') {
        // En prod esto consultaría a Meta API (adsEngine.getMetrics)
        setMetrics({
          roas: Number((Math.random() * (4.5 - 2.5) + 2.5).toFixed(2)),
          cpa: Math.floor(Math.random() * 5000) + 3000,
          spend: Math.floor(Math.random() * 15000) + 5000
        });
      }
    };

    const intervalId = setInterval(fetchMetrics, 15000);
    return () => clearInterval(intervalId);
  }, [launchStatus]);

  const handleNuclearLaunch = async () => {
    setIsLaunching(true);
    setLaunchStatus('running');
    setStatusMessage('Iniciando inyección de liquidez. Validando Píxel...');

    try {
      // Simulando instanciación y ejecución en backend
      setTimeout(async () => {
        setStatusMessage('Segmentando nivel nacional (CL)...');
        setTimeout(async () => {
          setStatusMessage('Inyectando creativos y copy de respuesta directa...');
          try {
            // Mock backend result
            const result = { success: true, message: "OK" };
            if (result.success) {
              setLaunchStatus('success');
              setStatusMessage('Campaña Activa. Entrando en fase de aprendizaje.');
              // Trigger initial metrics fetch
              setMetrics({ roas: 1.2, cpa: 15000, spend: 2000 });
            } else {
              setLaunchStatus('error');
              setStatusMessage(result.message);
            }
          } catch (e: any) {
            setLaunchStatus('error');
            setStatusMessage(`Error fatal: ${e.message}`);
          } finally {
            setIsLaunching(false);
          }
        }, 2000);
      }, 2000);

    } catch (e) {
      setLaunchStatus('error');
      setStatusMessage('Fallo al instanciar el motor de Ads.');
      setIsLaunching(false);
    }
  };

  return (
    <div className="p-5 border border-red-900/50 bg-[#1a0000] rounded-lg relative overflow-hidden flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-red-500 font-bold font-mono mb-1 flex items-center gap-2">
            <Rocket className="w-5 h-5" /> PROTOCOLO DE LIQUIDEZ (DÍA 1)
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            Lanza la campaña nacional con los Top 20 productos y copy agresivo. Emplea Meta Graph API para auto-generar campañas y Ads.
          </p>
        </div>

        {/* Live Metrics Widget */}
        <div className="bg-black/50 border border-red-900/30 rounded p-3 grid grid-cols-3 gap-4 min-w-[300px]">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-mono uppercase">ROAS</span>
            <span className="text-lg font-bold text-green-400 flex items-center gap-1">
              <Target className="w-3 h-3" /> {metrics.roas > 0 ? metrics.roas : '-.--'}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-red-900/30 px-4">
            <span className="text-[10px] text-gray-500 font-mono uppercase">CPA (CLP)</span>
            <span className="text-lg font-bold text-yellow-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {metrics.cpa > 0 ? metrics.cpa.toLocaleString() : '---'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Gasto (CLP)</span>
            <span className="text-lg font-bold text-red-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> {metrics.spend > 0 ? metrics.spend.toLocaleString() : '---'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2">
        {launchStatus === 'idle' || launchStatus === 'error' ? (
          <button 
            onClick={handleNuclearLaunch}
            disabled={isLaunching}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded text-lg uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Rocket className="w-6 h-6" />
            {launchStatus === 'error' ? 'REINTENTAR LANZAMIENTO' : 'LANZAMIENTO NUCLEAR'}
          </button>
        ) : (
          <div className={`w-full py-4 rounded text-center font-bold tracking-widest flex items-center justify-center gap-3 ${launchStatus === 'success' ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-red-900/20 text-red-400 border border-red-500/50'}`}>
            {launchStatus === 'running' ? (
              <><Activity className="w-5 h-5 animate-spin" /> EJECUTANDO PROTOCOLO...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> CAMPAÑA ACTIVA Y ESCALANDO</>
            )}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`mt-1 text-xs font-mono text-center ${launchStatus === 'error' ? 'text-red-400' : 'text-gray-400'} animate-pulse`}>
          {'>'} {statusMessage}
        </div>
      )}
    </div>
  );
}
