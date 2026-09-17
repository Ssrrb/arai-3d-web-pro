import React from 'react';
import { X, Building2, ShieldCheck, Laptop, Cpu, Cloud, CheckCircle, ArrowRight, PhoneCall } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const BusinessModal: React.FC<BusinessModalProps> = ({
  isOpen,
  onClose,
  onOpenContact
}) => {
  if (!isOpen) return null;

  const handleContactClick = () => {
    soundEngine.playClick();
    onClose();
    onOpenContact();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Arai para Negocios</h2>
              <p className="text-xs text-slate-500">
                Soluciones de movilidad, seguridad empresarial y gestión centralizada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hero Banner */}
          <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Flotas Corporativas & Empleados Móviles
              </span>
              <h3 className="text-lg font-bold text-white">
                Rendimiento 360° con ChromeOS Enterprise
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Despliegue sin intervención manual (Zero-Touch Enrollment), seguridad de arranque verificado y hasta 12.5 horas de productividad continua.
              </p>
            </div>
            <button
              onClick={handleContactClick}
              className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-wider rounded-lg font-bold hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center gap-2 flex-shrink-0"
            >
              <span>Solicitar Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Seguridad Hardware & Titan C</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chip de seguridad independiente, cifrado de almacenamiento de extremo a extremo y aislamiento de procesos por sandboxing nativo.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Cloud className="w-4 h-4 text-slate-700" />
                <span>Gestión Centralizada en la Nube</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Administración de flotas desde Google Admin Console con políticas de seguridad dinámicas, bloqueo remoto y actualizaciones automáticas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Laptop className="w-4 h-4 text-slate-700" />
                <span>Bisagra 360° Convertible</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diseño versátil para presentaciones ante clientes (Modo Atril), trabajo de campo (Tableta táctil) o estación de oficina (Laptop).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Cpu className="w-4 h-4 text-slate-700" />
                <span>Garantía & Soporte SLA</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Planes con sustitución prioritaria al siguiente día hábil, cobertura extendida de batería y repuestos directos de fábrica.
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              ¿Requieres cotización para más de 10 unidades?
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cerrar
              </button>
              <button
                onClick={handleContactClick}
                className="px-5 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contactar Ventas Negocios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
