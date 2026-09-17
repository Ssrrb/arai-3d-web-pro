import React from 'react';
import { X, GraduationCap, ShieldCheck, PenTool, Droplets, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const EducationModal: React.FC<EducationModalProps> = ({
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
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Arai para Educación</h2>
              <p className="text-xs text-slate-500">
                Diseñado para el aula moderna, estudiantes activos y aprendizaje interactivo
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
                Colegios, Institutos & Universidades
              </span>
              <h3 className="text-lg font-bold text-white">
                El Chromebook 2-en-1 más Resistente
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Chasis con protección perimetral contra caídas de hasta 1.2 metros (MIL-STD-810H), teclado en español a prueba de derrames y pantalla táctil Gorilla Glass.
              </p>
            </div>
            <button
              onClick={handleContactClick}
              className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-wider rounded-lg font-bold hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center gap-2 flex-shrink-0"
            >
              <span>Programa Escolar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Key Classroom Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Norma Militar MIL-STD-810H</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esquinas reforzadas con parachoques de elastómero capaces de absorber impactos cotidianos de mochilas y pupitres.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Droplets className="w-4 h-4 text-slate-700" />
                <span>Teclado Antiderrames (330 ml)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Canales de drenaje internos que protegen la placa madre ante salpicaduras accidentales de agua o bebidas en clase.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <PenTool className="w-4 h-4 text-slate-700" />
                <span>Lápiz Óptico Activo EMR Garaged</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stylus integrado con recarga automática en el chasis. Ideal para escritura manual, fórmulas científicas y anotación en PDF.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <span>Google Classroom Nativo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compatibilidad total con el ecosistema educativo de Google, inicio de sesión ultrarrápido entre diferentes alumnos y bloqueo para exámenes.
              </p>
            </div>
          </div>

          {/* Pricing & District pilots */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Descuentos especiales por volumen para centros educativos y fundaciones.
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
                <span>Solicitar Equipos de Prueba</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
