import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldCheck, ServerCrash, PlusSquare, Play, Pause } from 'lucide-react';
// import { HealthMonitor } from '../../lib/core/healthMonitor'; // No lo importamos directamente al cliente
// import { SkillGenerator } from '../../lib/core/skillGenerator';

export function AutonomyPanel() {
  const [healthNodes, setHealthNodes] = useState([
    { name: 'META_GRAPH_API', status: 'CLOSED', failures: 0 },
    { name: 'FLOW_PAYMENT', status: 'CLOSED', failures: 0 },
    { name: 'STARKEN_API', status: 'CLOSED', failures: 0 },
    { name: 'SUPABASE_PG', status: 'CLOSED', failures: 0 },
  ]);

  const [skills, setSkills] = useState([
    { name: 'auto_crop_image', status: 'Running', createdAt: '10/05/2026' },
    { name: 'scrape_competitor', status: 'Running', createdAt: '15/05/2026' },
    { name: 'generate_ad_copy', status: 'Paused', createdAt: '20/05/2026' }
  ]);

  const [isMining, setIsMining] = useState(false);

  const simulateProcessMining = () => {
    setIsMining(true);
    setTimeout(() => {
      // Simula que el skillGenerator detectó un cuello de botella y redactó el código real.
      const newSkill = {
        name: 'CleanGhostCarts',
        status: 'Running',
        createdAt: new Date().toLocaleDateString()
      };
      setSkills(prev => [newSkill, ...prev]);
      setIsMining(false);
    }, 3000);
  };

  const breakNode = (index: number) => {
    setHealthNodes(prev => {
      const newNodes = [...prev];
      const node = newNodes[index];
      node.failures += 1;
      if (node.failures >= 3) {
        node.status = 'OPEN'; // Circuit Breaker se abre
      }
      return newNodes;
    });
  };

  return (
    <div className="p-5 border border-purple-900/50 bg-[#0d001a] rounded-lg relative overflow-hidden flex flex-col h-full col-span-1 lg:col-span-2">
      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-purple-500 font-bold font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5" /> MOTOR DE ANTIFRAGILIDAD (GOD MODE V2)
          </h3>
          <p className="text-sm text-gray-400">
            Self-Healing (Circuit Breaker) & Auto-generación de Skills Ejecutables (Process Mining).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: System Health */}
        <div className="bg-black/60 border border-purple-900/30 rounded p-4">
          <h4 className="text-xs font-mono text-gray-500 mb-4 flex items-center gap-2 uppercase">
            <Activity className="w-4 h-4 text-purple-400" /> SYSTEM HEALTH & CIRCUIT BREAKER
          </h4>
          
          <div className="flex flex-col gap-3">
            {healthNodes.map((node, i) => (
              <div key={node.name} className="flex items-center justify-between p-2 bg-[#140026] rounded border border-purple-900/20">
                <div className="flex items-center gap-3">
                  {node.status === 'CLOSED' ? (
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <ServerCrash className="w-4 h-4 text-red-500 animate-pulse" />
                  )}
                  <span className="font-mono text-sm text-gray-300">{node.name}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-500 font-mono">Fails: {node.failures}/3</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    node.status === 'CLOSED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {node.status}
                  </span>
                  
                  {/* Botón oculto para simular fallos de API para testear el dashboard */}
                  <button onClick={() => breakNode(i)} className="w-2 h-2 rounded-full bg-red-900/50 hover:bg-red-500" title="Simular Fallo API"></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Skills List */}
        <div className="bg-black/60 border border-purple-900/30 rounded p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-mono text-gray-500 flex items-center gap-2 uppercase">
              <Cpu className="w-4 h-4 text-purple-400" /> SKILLS EJECUTABLES ACTIVAS
            </h4>
            <button 
              onClick={simulateProcessMining}
              disabled={isMining}
              className="text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 px-2 py-1 rounded flex items-center gap-1 transition-colors"
            >
              {isMining ? <Activity className="w-3 h-3 animate-spin" /> : <PlusSquare className="w-3 h-3" />}
              PROCESS MINING
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 max-h-[220px]">
            {skills.map((skill, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-purple-900/20">
                <div>
                  <div className="text-sm font-mono text-gray-300">{skill.name}.ts</div>
                  <div className="text-[10px] text-gray-500">Auto-Generado: {skill.createdAt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[10px] uppercase font-bold ${
                    skill.status === 'Running' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {skill.status === 'Running' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {skill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
