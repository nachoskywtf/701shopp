import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Key, ShieldCheck, Activity } from 'lucide-react';

interface MetaSetupModalProps {
  onClose: () => void;
}

export function MetaSetupModal({ onClose }: MetaSetupModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-green-900/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-green-900/50 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 text-green-500 font-mono font-bold">
            <Activity className="w-5 h-5" />
            <span>[MÓDULO 8] ASISTENTE DE INFRAESTRUCTURA META</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 font-sans text-gray-300">
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Protocolo de Cero a Lanzamiento</h2>
            <p className="text-sm text-gray-400">
              Detecté que no hay credenciales de Meta conectadas. Como no tienes cuenta de Developer, sigue estos pasos precisos. Yo haré el resto del trabajo pesado (Pixel, CAPI, Ad Account).
            </p>
          </div>

          {/* Paso 1 */}
          <div className="relative pl-8 border-l border-green-900/30">
            <div className="absolute -left-3 top-0 bg-[#0a0a0a] p-1">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">1</div>
            </div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Crear Cuenta de Meta Developer
              <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </h3>
            <p className="text-sm mt-2">
              Entra a <span className="text-blue-400">developers.facebook.com</span> e inicia sesión con tu Facebook personal.
              Haz clic en "Empezar" y regístrate como desarrollador (acepta los términos).
            </p>
          </div>

          {/* Paso 2 */}
          <div className="relative pl-8 border-l border-green-900/30">
            <div className="absolute -left-3 top-0 bg-[#0a0a0a] p-1">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">2</div>
            </div>
            <h3 className="font-bold text-white">Crear la App del Bot (/MKT701)</h3>
            <ul className="list-disc pl-4 text-sm mt-2 space-y-1 text-gray-400">
              <li>Haz clic en <strong>"Crear aplicación"</strong>.</li>
              <li>Selecciona <strong>"Otros"</strong> {'>'} <strong>"Negocios"</strong>.</li>
              <li>Nombre: <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">MKT701</code>.</li>
              <li>Crea la aplicación e ingresa tu contraseña de FB si te la pide.</li>
            </ul>
          </div>

          {/* Paso 3 */}
          <div className="relative pl-8 border-l border-transparent">
            <div className="absolute -left-3 top-0 bg-[#0a0a0a] p-1">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">3</div>
            </div>
            <h3 className="font-bold text-white">Extraer Credenciales</h3>
            <p className="text-sm mt-2 text-gray-400">
              En el menú lateral ve a <strong>Configuración {'>'} Información básica</strong>. 
              Copia el <span className="text-white font-mono">Identificador de la aplicación (App ID)</span> y la <span className="text-white font-mono">Clave secreta (App Secret)</span>.
            </p>
            
            <div className="mt-4 space-y-3 bg-black/50 p-4 rounded-lg border border-green-900/30">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-green-500 flex items-center gap-1">
                  <Key className="w-3 h-3" /> APP ID
                </label>
                <input type="text" placeholder="123456789012345" className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none focus:border-green-500 text-white font-mono" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-green-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> APP SECRET
                </label>
                <input type="password" placeholder="••••••••••••••••" className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none focus:border-green-500 text-white font-mono" />
              </div>
              <button className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-2 rounded mt-2 transition-colors">
                INYECTAR AL CORE /MKT701
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
