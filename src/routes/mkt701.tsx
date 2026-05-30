import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { TerminalBox } from '../components/mkt701/TerminalBox';
import { ModuleCard } from '../components/mkt701/ModuleCard';
import { MetaSetupModal } from '../components/mkt701/MetaSetupModal';
import { SwipeFilePanel } from '../components/mkt701/SwipeFilePanel';
import { VertexGeneratorPanel } from '../components/mkt701/VertexGeneratorPanel';
import { LaunchControlPanel } from '../components/mkt701/LaunchControlPanel';
import { ProfitGuardPanel } from '../components/mkt701/ProfitGuardPanel';
import { LogisticsPanel } from '../components/mkt701/LogisticsPanel';
import { AutonomyPanel } from '../components/mkt701/AutonomyPanel';
import { Brain, TrendingUp, Cpu, Facebook, RefreshCcw } from 'lucide-react';

export const Route = createFileRoute('/mkt701')({
  component: Mkt701Dashboard,
});

function Mkt701Dashboard() {
  const [showMetaModal, setShowMetaModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 md:p-8 selection:bg-green-500/30">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-green-500" />
            /MKT701
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-1">Autonomous E-Commerce Core v3000</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Flujo de Caja Hoy</p>
            <p className="text-xl font-mono text-green-400 font-bold">$0.00 CLP</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Terminal */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[400px]">
            <TerminalBox />
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <ProfitGuardPanel />
            </div>
            <div className="col-span-1 md:col-span-2 h-[280px]">
              <LogisticsPanel />
            </div>
            <div className="col-span-1 md:col-span-2">
              <SwipeFilePanel />
            </div>
            <div className="col-span-1 md:col-span-2">
              <VertexGeneratorPanel />
            </div>
          </div>
        </div>

        {/* Right Column: Infra & God Mode */}
        <div className="flex flex-col gap-6">
          
          {/* Liquidity Protocol */}
          <LaunchControlPanel />

          {/* Meta Infra */}
          <div className="p-5 border border-yellow-900/50 bg-[#141000] rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
            <h3 className="text-yellow-500 font-bold font-mono mb-2 flex items-center gap-2">
              <Facebook className="w-4 h-4" /> MOD 8: META AUTO-SETUP
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Credenciales de Meta Ads no detectadas. Requerido para iniciar flujos de tráfico pagado.
            </p>
            <button 
              onClick={() => setShowMetaModal(true)}
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> INYECTAR CREDENCIALES
            </button>
          </div>

          {/* God Mode V2 */}
          <AutonomyPanel />

        </div>
      </div>

      {showMetaModal && <MetaSetupModal onClose={() => setShowMetaModal(false)} />}
    </div>
  );
}
