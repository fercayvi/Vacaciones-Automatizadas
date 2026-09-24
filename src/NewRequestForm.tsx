import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import MinimalAlertModal, { AlertModalState } from './MinimalAlertModal';

export interface Solicitud {
  id: string;
  tipo: 'Vacaciones' | 'Día Flex';
  fechas: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estatus: 'Pendiente de Aprobación (Jefe)' | 'Aprobado' | 'Pendiente de Cancelación (Jefe)' | 'Cancelada (Reversada)';
  esExcepcion?: boolean;
  motivo?: string;
  fechaRegistro: string;
}

interface NewRequestFormProps {
  saldoVacacionesCalculado: number;
  saldoFlexCalculado: number;
  solicitudesExistentes: Solicitud[];
  jefeDirecto: string;
  onSolicitudCreada: (nuevaSol: Solicitud) => void;
}

export const NewRequestForm: React.FC<NewRequestFormProps> = ({
  saldoVacacionesCalculado,
  saldoFlexCalculado,
  solicitudesExistentes,
  jefeDirecto,
  onSolicitudCreada,
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Vacaciones' | 'Día Flex'>('Vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isExceptionMode, setIsExceptionMode] = useState(false);
  const [justification, setJustification] = useState('');

  // Estado del Modal Minimalista Unificado
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Cálculo de días hábiles entre fechaInicio y fechaFin
  const calcularDiasHabiles = (inicio: string, fin: string) => {
    if (!inicio) return 0;
    if (!fin) return 1;
    const start = new Date(inicio + 'T00:00:00');
    const end = new Date(fin + 'T00:00:00');
    if (end < start) return 0;
    let diasCount = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      // Excluir sábados (6) y domingos (0) para cálculo corporativo estándar
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        diasCount++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return diasCount === 0 ? 1 : diasCount;
  };

  const diasCalculados = calcularDiasHabiles(fechaInicio, fechaFin);

  const formatearRangoFechas = (inicio: string, fin: string) => {
    if (!inicio) return 'Fecha por definir';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const d1 = new Date(inicio + 'T00:00:00');
    const txt1 = `${d1.getDate()}/${meses[d1.getMonth()]}`;
    if (!fin || inicio === fin) return txt1;
    const d2 = new Date(fin + 'T00:00:00');
    const txt2 = `${d2.getDate()}/${meses[d2.getMonth()]}`;
    return `${txt1} - ${txt2}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fechaInicio) {
      setAlertModal({
        isOpen: true,
        title: 'Fecha requerida',
        message: 'Por favor selecciona la fecha de inicio.',
        type: 'error',
      });
      return;
    }

    if (tipoSeleccionado === 'Vacaciones' && !fechaFin) {
      setAlertModal({
        isOpen: true,
        title: 'Fecha requerida',
        message: 'Por favor selecciona la fecha de fin de vacaciones.',
        type: 'error',
      });
      return;
    }

    const dInicio = new Date(fechaInicio + 'T00:00:00');
    const finFinal = tipoSeleccionado === 'Día Flex' ? fechaInicio : fechaFin;
    const dFin = new Date(finFinal + 'T00:00:00');

    // Validación de fin de semana
    if (dInicio.getDay() === 0 || dInicio.getDay() === 6 || dFin.getDay() === 0 || dFin.getDay() === 6) {
      setAlertModal({
        isOpen: true,
        title: 'Fechas inválidas',
        message: 'No se pueden seleccionar fines de semana (sábado o domingo).',
        type: 'error',
      });
      return;
    }

    // Regla Días Flex: Rango no mayor a 1 día
    if (tipoSeleccionado === 'Día Flex') {
      const fechaFinEfectiva = fechaFin || fechaInicio;
      const dFinFlex = new Date(fechaFinEfectiva + 'T00:00:00');
      const diffTime = dFinFlex.getTime() - dInicio.getTime();
      const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDias > 1) {
        setAlertModal({
          isOpen: true,
          title: 'Regla de Días Flex',
          message: 'Los Días Flex son individuales y no pueden tomarse de forma consecutiva.',
          type: 'error',
        });
        return;
      }
    }

    const diasTotal = tipoSeleccionado === 'Día Flex' ? 1 : diasCalculados;

    if (diasTotal <= 0) {
      setAlertModal({
        isOpen: true,
        title: 'Fechas inválidas',
        message: 'No se pueden seleccionar fines de semana (sábado o domingo).',
        type: 'error',
      });
      return;
    }

    // Validaciones en modo normal vs excepción
    if (!isExceptionMode) {
      // Regla 1: Validar anticipación de 7 días
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicioDate = new Date(fechaInicio + 'T00:00:00');
      const diffTime = inicioDate.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDias < 7) {
        setAlertModal({
          isOpen: true,
          title: 'Anticipación requerida',
          message: 'Las solicitudes deben realizarse con al menos 7 días de anticipación.',
          type: 'error',
        });
        return;
      }

      // Regla 2: Validar saldo suficiente
      const saldoDisponible = tipoSeleccionado === 'Vacaciones' ? saldoVacacionesCalculado : saldoFlexCalculado;
      if (diasTotal > saldoDisponible) {
        setAlertModal({
          isOpen: true,
          title: 'Saldo insuficiente',
          message: 'No cuentas con los días suficientes para cubrir esta solicitud.',
          type: 'error',
        });
        return;
      }

      // Regla 3: No permitir Días Flex consecutivos con otras solicitudes
      if (tipoSeleccionado === 'Día Flex') {
        const tieneConsecutivo = solicitudesExistentes.some((s) => {
          if (s.tipo !== 'Día Flex' || s.estatus === 'Cancelada (Reversada)') return false;
          const sDate = new Date(s.fechaInicio + 'T00:00:00');
          const diff = Math.abs(Math.round((inicioDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
          return diff <= 1;
        });

        if (tieneConsecutivo) {
          setAlertModal({
            isOpen: true,
            title: 'Regla de Días Flex',
            message: 'Los Días Flex son individuales y no pueden tomarse de forma consecutiva.',
            type: 'error',
          });
          return;
        }
      }
    } else {
      // Modo Excepción: Justificación obligatoria (mínimo 10 caracteres)
      if (!justification || justification.trim().length < 10) {
        setAlertModal({
          isOpen: true,
          title: 'Justificación requerida',
          message: 'La justificación es obligatoria para el Modo Excepción y debe tener al menos 10 caracteres.',
          type: 'error',
        });
        return;
      }
    }

    // Crear solicitud
    const nuevaSol: Solicitud = {
      id: `SOL-2026-00${solicitudesExistentes.length + 2}`,
      tipo: tipoSeleccionado,
      fechas: formatearRangoFechas(fechaInicio, finFinal),
      fechaInicio: fechaInicio,
      fechaFin: finFinal,
      dias: diasTotal,
      estatus: 'Pendiente de Aprobación (Jefe)',
      esExcepcion: isExceptionMode,
      motivo: isExceptionMode ? justification.trim() : undefined,
      fechaRegistro: 'Hoy',
    };

    onSolicitudCreada(nuevaSol);

    // Reset de campos
    setFechaInicio('');
    setFechaFin('');
    setJustification('');
    setIsExceptionMode(false);

    // Abrir Modal de Confirmación Minimalista
    setAlertModal({
      isOpen: true,
      title: 'Solicitud Enviada',
      message: 'Tu solicitud ha sido turnada a tu jefatura para revisión',
      type: 'success',
    });
  };

  const isSubmitDisabled = isExceptionMode && justification.trim().length < 10;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="border-b border-gray-100 pb-3 mb-5">
          <h3 className="text-base font-bold text-gray-900">
            Nueva Solicitud
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Completa el formulario para enviar a revisión de tu jefatura.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Tipo: "Vacaciones" o "Día Flex" */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Tipo de Solicitud
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoSeleccionado('Vacaciones')}
                className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
                  tipoSeleccionado === 'Vacaciones'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vacaciones
              </button>
              <button
                type="button"
                onClick={() => setTipoSeleccionado('Día Flex')}
                className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
                  tipoSeleccionado === 'Día Flex'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Día Flex
              </button>
            </div>
          </div>

          {/* Selector de Fechas: Inicio y Fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="fecha-inicio"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Fecha de inicio
              </label>
              <input
                id="fecha-inicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  if (tipoSeleccionado === 'Día Flex' && !fechaFin) {
                    setFechaFin(e.target.value);
                  }
                }}
                className="w-full text-xs rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="fecha-fin"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Fecha de fin {tipoSeleccionado === 'Día Flex' && <span className="text-gray-400 font-normal">(individual)</span>}
              </label>
              <input
                id="fecha-fin"
                type="date"
                required={tipoSeleccionado === 'Vacaciones'}
                value={tipoSeleccionado === 'Día Flex' ? (fechaFin || fechaInicio) : fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || undefined}
                className="w-full text-xs rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Cálculo de días solicitados en vivo */}
          {fechaInicio && (
            <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between text-gray-700 font-mono">
              <span>Días laborales a solicitar:</span>
              <span className="font-bold text-gray-900">
                {tipoSeleccionado === 'Día Flex' ? '1 día' : `${diasCalculados} día(s)`}
              </span>
            </div>
          )}

          {/* Nota visual requerida debajo de las fechas */}
          <div className="rounded border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Las solicitudes requieren 7 días de anticipación. No se permiten días Flex consecutivos.
            </p>
          </div>

          {/* Regla de Negocio: Modo Excepción */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label
                htmlFor="toggle-modo-excepcion"
                className="text-xs font-medium text-gray-900 cursor-pointer flex flex-col pr-3"
              >
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>Activar Modo Excepción</span>
                  {isExceptionMode && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                      Activo
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                  Permite omitir reglas de anticipación, límite de días Flex o falta de saldo.
                </span>
              </label>

              {/* Toggle Switch */}
              <button
                type="button"
                id="toggle-modo-excepcion"
                role="switch"
                aria-checked={isExceptionMode}
                onClick={() => setIsExceptionMode(!isExceptionMode)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isExceptionMode ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isExceptionMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Campo de Justificación Obligatorio si isExceptionMode es true */}
          {isExceptionMode && (
            <div className="pt-2 space-y-3 animate-fadeIn">
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Las solicitudes por excepción requieren revisión detallada y aprobación manual obligatoria por parte de {jefeDirecto}.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="justification"
                    className="block text-xs font-semibold text-gray-700"
                  >
                    Justificación (Obligatoria) <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      justification.trim().length >= 10
                        ? 'text-emerald-600 font-semibold'
                        : 'text-amber-700 font-medium'
                    }`}
                  >
                    {justification.trim().length}/10 caracteres mín.
                  </span>
                </div>
                <textarea
                  id="justification"
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Describe el motivo extraordinario o de fuerza mayor para evaluación de tu Jefatura..."
                  className="w-full text-xs rounded border border-amber-300 p-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-amber-50/20"
                />
                {justification.trim().length > 0 && justification.trim().length < 10 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Faltan {10 - justification.trim().length} caracter(es) para habilitar el envío.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botón de envío */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-2.5 px-4 border rounded text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                isSubmitDisabled
                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-transparent cursor-pointer shadow-sm'
              }`}
            >
              <span>Enviar Solicitud al Jefe Directo</span>
              {isExceptionMode && (
                <span className="text-[10px] bg-amber-500/20 text-amber-100 px-1.5 py-0.5 rounded font-mono">
                  Excepción
                </span>
              )}
            </button>
            {isSubmitDisabled && (
              <p className="text-[11px] text-gray-500 text-center mt-1.5">
                El botón se habilitará al completar la justificación obligatoria (mínimo 10 caracteres).
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Modal Minimalista de Notificación para Envío y Validaciones de Solicitud */}
      <MinimalAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

export default NewRequestForm;
