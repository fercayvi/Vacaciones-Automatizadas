import React from 'react';
import {
  X,
  Check,
  AlertCircle,
  Calendar,
  User,
  Building,
  Clock,
  FileText,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export interface RequestDetailData {
  id: string;
  folio?: string;
  colaboradorNombre?: string;
  colaborador?: string;
  nomina?: string;
  colaboradorId?: string;
  employeeId?: string;
  departamento?: string;
  colaboradorDepto?: string;
  tipo: 'Vacaciones' | 'Día Flex' | 'Home week';
  fechas?: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  saldoDisponible?: number;
  comentarios?: string | null;
  fechaSolicitud?: string;
  estatus: string;
  esExcepcion?: boolean;
  motivoExcepcion?: string;
  jefeDirecto?: string;
  fechaResolucion?: string;
}

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestDetailData | null;
  isReadOnly: boolean;
  onApprove?: (req: RequestDetailData) => void;
  onReject?: (req: RequestDetailData) => void;
  onApproveCancelacion?: (req: RequestDetailData) => void;
  onRejectCancelacion?: (req: RequestDetailData) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  isReadOnly,
  onApprove,
  onReject,
  onApproveCancelacion,
  onRejectCancelacion
}) => {
  if (!isOpen || !request) return null;

  const folio = request.folio || request.id;
  const nombre = request.colaboradorNombre || request.colaborador || 'Colaborador no especificado';
  const nomina = request.colaboradorId || request.employeeId || request.nomina || 'N/A';
  const depto = request.departamento || request.colaboradorDepto || 'General';
  const saldo = request.saldoDisponible ?? (request.esExcepcion ? 0 : 10);
  const esDeficit = saldo <= 0 || request.dias > saldo;
  const rangoFechas =
    request.fechas ||
    `${request.fechaInicio} al ${request.fechaFin}`;
  const comentariosTexto =
    request.comentarios?.trim() ||
    request.motivoExcepcion?.trim() ||
    'Sin comentarios o justificaciones adicionales registradas en esta solicitud.';

  const renderBadgeEstatus = () => {
    switch (request.estatus) {
      case 'Pendiente':
      case 'Pendiente de Aprobación (Jefe)':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Pendiente de Aprobación
          </span>
        );
      case 'Pendiente de Cancelación (Jefe)':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse"></span>
            Solicitud de Cancelación
          </span>
        );
      case 'Aprobada':
      case 'Aprobado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Aprobada
          </span>
        );
      case 'Rechazada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
            Rechazada
          </span>
        );
      case 'Cancelada':
      case 'Cancelado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
            Cancelada
          </span>
        );
      case 'Expirado por Sistema':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
            Expirado por Sistema
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {request.estatus}
          </span>
        );
    }
  };

  const esPendiente =
    request.estatus === 'Pendiente' ||
    request.estatus === 'Pendiente de Aprobación (Jefe)';
  const esCancelacionPendiente =
    request.estatus === 'Pendiente de Cancelación (Jefe)';

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            CABECERA DEL MODAL: Folio y Estatus
            ======================================================== */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/75 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Detalle de Solicitud
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-bold text-gray-900">
                  {folio}
                </span>
                {request.esExcepcion && (
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-medium">
                    Excepción
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {renderBadgeEstatus()}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            CUERPO DEL MODAL: Grid de 2 Columnas Estructurado
            ======================================================== */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Grid de Datos Generales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Colaborador */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-gray-500" />
                Colaborador
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {nombre}
              </p>
            </div>

            {/* Nómina */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                No. Nómina
              </span>
              <p className="text-sm font-mono font-medium text-gray-800">
                {nomina}
              </p>
            </div>

            {/* Departamento */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-gray-500" />
                Departamento
              </span>
              <p className="text-sm font-normal text-gray-700">
                {depto}
              </p>
            </div>

            {/* Tipo de Solicitud */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                Tipo de Beneficio
              </span>
              <p className="text-sm font-semibold text-gray-900">
                {request.tipo}
              </p>
            </div>

            {/* Rango de Fechas */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Período Solicitado
              </span>
              <p className="text-sm font-mono font-normal text-gray-800">
                {rangoFechas}
              </p>
            </div>

            {/* Días Solicitados */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                Días Solicitados
              </span>
              <p className="text-sm font-bold text-gray-900 tabular-nums">
                {request.dias} {request.dias === 1 ? 'día hábil' : 'días hábiles'}
              </p>
            </div>

            {/* Saldo antes del permiso */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                Saldo Disponible
              </span>
              {esDeficit ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm text-red-600 font-semibold">
                    {saldo <= 0 ? '0 días' : `${saldo} ${saldo === 1 ? 'día' : 'días'}`}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {saldo} {saldo === 1 ? 'día' : 'días'}
                </p>
              )}
            </div>

            {/* Jefe Directo / Solicitud */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[11px] uppercase font-semibold text-gray-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-gray-500" />
                Línea de Mando
              </span>
              <p className="text-sm font-normal text-gray-700">
                {request.jefeDirecto || 'Emmanuel Muñoz'}
              </p>
            </div>
          </div>

          {/* Justificación / Comentarios completos */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-[11px] uppercase font-semibold text-gray-500 flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
              Comentarios / Justificación Institucional
            </span>
            <p className="text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-wrap">
              "{comentariosTexto}"
            </p>
            {request.fechaSolicitud && (
              <p className="text-[11px] text-gray-400 font-mono mt-2 pt-2 border-t border-gray-200/60">
                Registrado el: {request.fechaSolicitud}
              </p>
            )}
          </div>
        </div>

        {/* ========================================================
            PIE DEL MODAL: Acciones según isReadOnly
            ======================================================== */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          {isReadOnly ? (
            // Modo Solo Lectura (Auditoría TyC)
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                Solo lectura · Auditoría TyC
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : (
            // Modo Jefe Directo (Acciones de aprobación y rechazo)
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                {esPendiente && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onReject) onReject(request);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Rechazar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onApprove) onApprove(request);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Aprobar</span>
                    </button>
                  </>
                )}

                {esCancelacionPendiente && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onRejectCancelacion) onRejectCancelacion(request);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Rechazar Cancelación</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onApproveCancelacion) onApproveCancelacion(request);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Aprobar Cancelación</span>
                    </button>
                  </>
                )}

                {!esPendiente && !esCancelacionPendiente && (
                  <span className="text-xs text-gray-400 font-mono">
                    Trámite resuelto
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
