import React, { useState } from 'react';
import { Info, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import MinimalAlertModal, { AlertModalState } from './MinimalAlertModal';

export interface Solicitud {
  id: string;
  folio?: string;
  tipo: 'Vacaciones' | 'Día Flex' | 'Home week';
  fechas: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estatus: 'Pendiente de Aprobación (Jefe)' | 'Aprobado' | 'Pendiente de Cancelación (Jefe)' | 'Cancelada (Reversada)';
  esExcepcion?: boolean;
  motivo?: string;
  fechaRegistro: string;
  escalarAGerencia?: boolean;
  destinatarioAprobacion?: string;
}

interface NewRequestFormProps {
  saldoVacacionesCalculado: number;
  saldoFlexCalculado: number;
  saldoHomeWeekCalculado?: number;
  solicitudesExistentes: Solicitud[];
  jefeDirecto: string;
  puestoJefe?: string;
  onSolicitudCreada: (nuevaSol: Solicitud) => void;
}

export const NewRequestForm: React.FC<NewRequestFormProps> = ({
  saldoVacacionesCalculado,
  saldoFlexCalculado,
  saldoHomeWeekCalculado = 1,
  solicitudesExistentes,
  jefeDirecto,
  puestoJefe = 'Gerencia de Centro de Servicios',
  onSolicitudCreada,
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Vacaciones' | 'Día Flex' | 'Home week'>('Vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isExceptionMode, setIsExceptionMode] = useState(false);
  const [justification, setJustification] = useState('');

  // Checkbox de Políticas de Compliance para Home week
  const [aceptoPoliticaHomeWeek, setAceptoPoliticaHomeWeek] = useState(false);

  // Estado del Modal Minimalista Unificado
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Validador estricto del bloque Lunes a Viernes para Home week
  const esBloqueLunesViernesValido = (inicio: string, fin: string) => {
    if (!inicio || !fin) return false;
    const start = new Date(inicio + 'T00:00:00');
    const end = new Date(fin + 'T00:00:00');
    // JS getDay(): 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
    if (start.getDay() !== 1) return false; // Debe iniciar exactamente en Lunes
    if (end.getDay() !== 5) return false;   // Debe finalizar exactamente en Viernes
    const diffTime = end.getTime() - start.getTime();
    const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDias === 4; // Lunes a Viernes de la misma semana = 4 días de separación
  };

  // Cálculo de días hábiles entre fechaInicio y fechaFin
  const calcularDiasHabiles = (inicio: string, fin: string) => {
    if (!inicio) return 0;
    if (tipoSeleccionado === 'Día Flex') return 1;
    if (tipoSeleccionado === 'Home week') return 5;
    if (!fin) return 1;

    const start = new Date(inicio + 'T00:00:00');
    const end = new Date(fin + 'T00:00:00');
    if (end < start) return 0;
    let diasCount = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      // Excluir fines de semana (0=Dom, 6=Sáb)
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

  // Cambio dinámico de tipo con ajustes automáticos
  const handleCambiarTipo = (nuevoTipo: 'Vacaciones' | 'Día Flex' | 'Home week') => {
    setTipoSeleccionado(nuevoTipo);
    if (nuevoTipo === 'Día Flex' && fechaInicio) {
      setFechaFin(fechaInicio);
    } else if (nuevoTipo === 'Home week' && fechaInicio) {
      const d = new Date(fechaInicio + 'T00:00:00');
      if (d.getDay() === 1) {
        const viernes = new Date(d);
        viernes.setDate(viernes.getDate() + 4);
        const y = viernes.getFullYear();
        const m = String(viernes.getMonth() + 1).padStart(2, '0');
        const day = String(viernes.getDate()).padStart(2, '0');
        setFechaFin(`${y}-${m}-${day}`);
      }
    }
  };

  const handleFechaInicioChange = (val: string) => {
    setFechaInicio(val);
    if (tipoSeleccionado === 'Día Flex') {
      setFechaFin(val);
    } else if (tipoSeleccionado === 'Home week' && val) {
      const d = new Date(val + 'T00:00:00');
      // Si el colaborador seleccionó un Lunes, autocompletar al Viernes de esa misma semana
      if (d.getDay() === 1) {
        const viernes = new Date(d);
        viernes.setDate(viernes.getDate() + 4);
        const y = viernes.getFullYear();
        const m = String(viernes.getMonth() + 1).padStart(2, '0');
        const day = String(viernes.getDate()).padStart(2, '0');
        setFechaFin(`${y}-${m}-${day}`);
      }
    }
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

    if (tipoSeleccionado === 'Home week' && !fechaFin) {
      setAlertModal({
        isOpen: true,
        title: 'Fecha requerida',
        message: 'Por favor selecciona la fecha de fin para tu Home week.',
        type: 'error',
      });
      return;
    }

    const dInicio = new Date(fechaInicio + 'T00:00:00');
    const finFinal = tipoSeleccionado === 'Día Flex' ? fechaInicio : fechaFin;
    const dFin = new Date(finFinal + 'T00:00:00');

    // Validación específica y estricta para Home week (Lunes a Viernes exactos)
    if (tipoSeleccionado === 'Home week') {
      const esValido = esBloqueLunesViernesValido(fechaInicio, fechaFin);
      if (!esValido) {
        setAlertModal({
          isOpen: true,
          title: 'Fechas de Home week inválidas',
          message: 'El Home week debe tomarse en un bloque completo de Lunes a Viernes.',
          type: 'error',
        });
        return;
      }

      // Checkbox obligatorio de compliance
      if (!aceptoPoliticaHomeWeek) {
        setAlertModal({
          isOpen: true,
          title: 'Aceptación de Políticas Requerida',
          message: 'Debes aceptar las políticas de cámara encendida y código de vestimenta para enviar tu solicitud de Home week.',
          type: 'error',
        });
        return;
      }
    } else {
      // Para Vacaciones y Día Flex: Validación de que no empiece ni termine en fin de semana
      if (dInicio.getDay() === 0 || dInicio.getDay() === 6 || dFin.getDay() === 0 || dFin.getDay() === 6) {
        setAlertModal({
          isOpen: true,
          title: 'Fechas inválidas',
          message: 'No se pueden seleccionar fines de semana (sábado o domingo).',
          type: 'error',
        });
        return;
      }
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

    const diasTotal =
      tipoSeleccionado === 'Día Flex'
        ? 1
        : tipoSeleccionado === 'Home week'
        ? 5
        : diasCalculados;

    if (diasTotal <= 0) {
      setAlertModal({
        isOpen: true,
        title: 'Fechas inválidas',
        message: 'No se pueden seleccionar días inhábiles para la solicitud.',
        type: 'error',
      });
      return;
    }

    // Validaciones en modo normal vs modo excepción
    if (!isExceptionMode) {
      // Regla 1: Validar anticipación de 7 días (Aplica para Vacaciones, Día Flex y Home week)
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

      // Regla 2: Validar saldo suficiente según el tipo de solicitud
      if (tipoSeleccionado === 'Vacaciones') {
        if (diasTotal > saldoVacacionesCalculado) {
          setAlertModal({
            isOpen: true,
            title: 'Saldo insuficiente',
            message: 'No cuentas con los días de vacaciones suficientes para cubrir esta solicitud.',
            type: 'error',
          });
          return;
        }
      } else if (tipoSeleccionado === 'Día Flex') {
        if (diasTotal > saldoFlexCalculado) {
          setAlertModal({
            isOpen: true,
            title: 'Saldo insuficiente',
            message: 'No cuentas con días Flex disponibles para cubrir esta solicitud.',
            type: 'error',
          });
          return;
        }
      } else if (tipoSeleccionado === 'Home week') {
        if (saldoHomeWeekCalculado <= 0) {
          setAlertModal({
            isOpen: true,
            title: 'Saldo de Home week no disponible',
            message: 'Ya has utilizado o tienes en trámite tu beneficio de Home week correspondiente a este semestre.',
            type: 'error',
          });
          return;
        }
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

    // Generación del Folio Global (Formato: FOL-YYYY-XXXX)
    const anioActual = new Date().getFullYear();
    const numeroAleatorio = String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0');
    const nuevoFolio = `FOL-${anioActual}-${numeroAleatorio}`;

    // Crear solicitud
    const nuevaSol: Solicitud = {
      id: nuevoFolio,
      folio: nuevoFolio,
      tipo: tipoSeleccionado,
      fechas: formatearRangoFechas(fechaInicio, finFinal),
      fechaInicio: fechaInicio,
      fechaFin: finFinal,
      dias: diasTotal,
      estatus: 'Pendiente de Aprobación (Jefe)',
      esExcepcion: isExceptionMode,
      motivo: isExceptionMode ? justification.trim() : undefined,
      fechaRegistro: 'Hoy',
      destinatarioAprobacion: jefeDirecto,
    };

    onSolicitudCreada(nuevaSol);

    // Reset de campos
    setFechaInicio('');
    setFechaFin('');
    setJustification('');
    setIsExceptionMode(false);
    setAceptoPoliticaHomeWeek(false);

    // Abrir Modal de Confirmación Minimalista con Folio Global destacado
    setAlertModal({
      isOpen: true,
      title: '¡Solicitud enviada con éxito!',
      message: `¡Solicitud enviada con éxito! Tu folio de rastreo es: ${nuevoFolio}. Ha sido turnada a ${jefeDirecto} para su revisión y aprobación.`,
      type: 'success',
    });
  };

  // Validación de error visual en vivo para Home week
  const fechasHomeWeekInvalidas =
    tipoSeleccionado === 'Home week' &&
    Boolean(fechaInicio) &&
    Boolean(fechaFin) &&
    !esBloqueLunesViernesValido(fechaInicio, fechaFin);

  const isSubmitDisabled =
    (isExceptionMode && justification.trim().length < 10) ||
    (tipoSeleccionado === 'Home week' && !aceptoPoliticaHomeWeek) ||
    (tipoSeleccionado === 'Home week' && (!fechaInicio || !fechaFin || fechasHomeWeekInvalidas));

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
          {/* Selector de Beneficio: "Vacaciones", "Día Flex" o "Home week" */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Tipo de Solicitud
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCambiarTipo('Vacaciones')}
                className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
                  tipoSeleccionado === 'Vacaciones'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vacaciones
              </button>
              <button
                type="button"
                onClick={() => handleCambiarTipo('Día Flex')}
                className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
                  tipoSeleccionado === 'Día Flex'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Día Flex
              </button>
              <button
                type="button"
                onClick={() => handleCambiarTipo('Home week')}
                className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
                  tipoSeleccionado === 'Home week'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Home week
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
                Fecha de inicio {tipoSeleccionado === 'Home week' && <span className="text-blue-600 font-semibold">(Lunes)</span>}
              </label>
              <input
                id="fecha-inicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                className="w-full text-xs rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="fecha-fin"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Fecha de fin{' '}
                {tipoSeleccionado === 'Día Flex' && (
                  <span className="text-gray-400 font-normal">(individual)</span>
                )}
                {tipoSeleccionado === 'Home week' && (
                  <span className="text-blue-600 font-semibold">(Viernes)</span>
                )}
              </label>
              <input
                id="fecha-fin"
                type="date"
                required={tipoSeleccionado === 'Vacaciones' || tipoSeleccionado === 'Home week'}
                disabled={tipoSeleccionado === 'Día Flex'}
                value={tipoSeleccionado === 'Día Flex' ? (fechaFin || fechaInicio) : fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || undefined}
                className="w-full text-xs rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Alerta Visual de Bloque Invalido para Home week */}
          {fechasHomeWeekInvalidas && (
            <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  El Home week debe tomarse en un bloque completo de Lunes a Viernes.
                </p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Verifica que la fecha de inicio sea un Lunes y la fecha de fin sea el Viernes de esa misma semana (exactamente 5 días laborales).
                </p>
              </div>
            </div>
          )}

          {/* Cálculo de días solicitados en vivo */}
          {fechaInicio && (
            <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between text-gray-700 font-mono">
              <span>Días laborales a solicitar:</span>
              <span className="font-bold text-gray-900">
                {tipoSeleccionado === 'Día Flex'
                  ? '1 día'
                  : tipoSeleccionado === 'Home week'
                  ? '5 días (1 Semana)'
                  : `${diasCalculados} día(s)`}
              </span>
            </div>
          )}

          {/* Nota visual informativa debajo de las fechas */}
          <div className="rounded border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {tipoSeleccionado === 'Home week'
                ? 'El beneficio Home week requiere 7 días de anticipación y debe solicitarse en un bloque de 5 días hábiles continuos de Lunes a Viernes (1 semana por semestre).'
                : 'Las solicitudes requieren 7 días de anticipación. No se permiten días Flex consecutivos.'}
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
                  Las solicitudes por excepción requieren revisión detallada y aprobación manual obligatoria por parte de{' '}
                  {jefeDirecto}.
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

          {/* Checkbox de Políticas de Compliance Obligatorio para Home week */}
          {tipoSeleccionado === 'Home week' && (
            <div className="pt-2 border-t border-gray-100 animate-fadeIn">
              <label className="flex items-start gap-2.5 cursor-pointer select-none bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                <input
                  type="checkbox"
                  required
                  checked={aceptoPoliticaHomeWeek}
                  onChange={(e) => setAceptoPoliticaHomeWeek(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4 shrink-0"
                />
                <span className="text-xs text-gray-800 leading-snug">
                  Acepto mantener la cámara encendida en las reuniones y respetar el código de vestimenta de la oficina durante mi Home week. <span className="text-red-500 font-bold">*</span>
                </span>
              </label>
              {!aceptoPoliticaHomeWeek && (
                <p className="text-[11px] text-gray-500 mt-1 pl-1">
                  * Este consentimiento es obligatorio para habilitar el envío del beneficio Home week.
                </p>
              )}
            </div>
          )}

          {/* Botón de envío */}
          <div className="pt-2">
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
                {tipoSeleccionado === 'Home week' && !aceptoPoliticaHomeWeek
                  ? 'Debes aceptar las políticas de Home week para habilitar el botón de envío.'
                  : tipoSeleccionado === 'Home week' && fechasHomeWeekInvalidas
                  ? 'Selecciona un bloque válido de Lunes a Viernes para habilitar el envío.'
                  : 'El botón se habilitará al completar todos los requisitos obligatorios.'}
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
