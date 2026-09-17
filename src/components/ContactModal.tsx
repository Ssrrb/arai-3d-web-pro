import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Building2, GraduationCap } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: 'general' | 'negocios' | 'educacion';
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'general'
}) => {
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSuccess();
    setSubmitted(true);
    setTimeout(() => {
      // Keep feedback for 2.5 seconds then close
    }, 2500);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setOrganization('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contacto & Asesoría</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Equipo comercial y técnico de Arai Chromebook Convertible
            </p>
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
          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">¡Mensaje Recibido!</h3>
              <p className="text-sm text-slate-600 max-w-md">
                Gracias por contactarnos. Un especialista comercial o técnico se pondrá en contacto contigo en un plazo menor a 24 horas laborables.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Quick Contact Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Email</div>
                    <div className="text-xs font-semibold text-slate-800 truncate">contacto@arai.com</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Atención</div>
                    <div className="text-xs font-semibold text-slate-800 truncate">+34 900 839 210</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Sede Central</div>
                    <div className="text-xs font-semibold text-slate-800 truncate">Madrid / Global</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1.5">
                    Área de Interés
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopic('general')}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                        topic === 'general'
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      General
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopic('negocios')}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                        topic === 'negocios'
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Negocios
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopic('educacion')}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                        topic === 'educacion'
                          ? 'border-black bg-black text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Educación
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                    Organización o Centro Educativo
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Empresa, colegio o universidad"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                    Mensaje o Consulta *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tus requerimientos, volumen de equipos o consultas técnicas..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensaje</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
