import React from 'react';
import { CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  status: 'active' | 'warning' | 'standby';
  onClick?: () => void;
}

export function ModuleCard({ title, description, status, onClick }: ModuleCardProps) {
  const statusConfig = {
    active: {
      color: 'text-green-500',
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      icon: <CheckCircle2 className="w-5 h-5" />,
      text: 'ACTIVO'
    },
    warning: {
      color: 'text-yellow-500',
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      icon: <AlertTriangle className="w-5 h-5" />,
      text: 'REQUIERE ACCIÓN'
    },
    standby: {
      color: 'text-blue-500',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      icon: <PlayCircle className="w-5 h-5" />,
      text: 'STANDBY'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border ${config.border} bg-[#0a0a0a] hover:bg-[#111] transition-all cursor-pointer flex flex-col h-full`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-mono font-bold text-gray-200 text-sm tracking-tight">{title}</h3>
        <div className={`flex items-center gap-1.5 text-xs font-bold tracking-widest ${config.color} ${config.bg} px-2 py-1 rounded-sm`}>
          {config.icon}
          <span>{config.text}</span>
        </div>
      </div>
      <p className="text-gray-500 text-xs mt-2 leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}
