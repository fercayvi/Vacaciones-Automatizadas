import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertCircle,
  Check,
  X,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Key,
  Info
} from 'lucide-react';
import MinimalAlertModal, { AlertModalState } from './MinimalAlertModal';

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export const CURRENT_USER_DEFAULT: CurrentUser = {
  id: 'EMP-04829',
  name: 'Fernando Carrillo',
  email: 'fecarrillo@ayvi.com.mx',
  role: 'Jefe Directo / Supervisor',
};

export interface SolicitudSubordinado {
  id: string;
  colaboradorId: string; // Identificador del empleado (ej. EMP-05120)
  employeeId?: string; // Alias compatible
  colaboradorNombre: string;
  colaboradorPuesto: string;
  colaboradorDepto: string;
  colaboradorEmail: string;
  tipo: 'Vacaciones' | 'Día Flex';
  fechas: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  saldoDisponible: number; // Saldo de días hábiles disponibles antes de la solicitud
  comentarios?: string | null; // Justificación o notas adjuntas por el colaborador
  fechaSolicitud: string;
  estatus:
    | 'Pendiente'
    | 'Aprobada'
    | 'Rechazada'
    | 'Pendiente de Cancelación (Jefe)'
    | 'Cancelada'
    | 'Cancelado'
    | 'Expirado por Sistema';
  esCancelacion?: boolean;
  saldoActualVacaciones?: number;
  esExcepcion?: boolean;
  motivoExcepcion?: string;
  motivoRechazo?: string;
  fechaResolucion?: string;
  avatarColor?: string;
}

interface ApprovalsViewProps {
  // Usuario actualmente autenticado (opcional, por defecto Fernando Carrillo EMP-04829)
  currentUser?: CurrentUser;
  // Notificación externa opcional para conectar con App.tsx si se desea
  onToastFeedback?: (tipo: 'exito' | 'error' | 'info', mensaje: string) => void;
  // Estado inicial opcional de solicitudes o callback cuando cambie el conteo
  onPendingCountChange?: (count: number) => void;
}

// Nombres de meses en español para la navegación del calendario
const MESES_ESPANOL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

// =========================================================================
// SINGLE SOURCE OF TRUTH: Solicitudes del Equipo (Mock Requests Centralizado)
// =========================================================================
export const MOCK_REQUESTS: SolicitudSubordinado[] = [
  {
    id: 'SOL-2026-008',
    colaboradorId: 'EMP-05309',
    employeeId: 'EMP-05309',
    colaboradorNombre: 'Alejandro Morales Cruz',
    colaboradorPuesto: 'Desarrollador Backend Cloud',
    colaboradorDepto: 'Ingeniería y TI',
    colaboradorEmail: 'amorales@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '09/Oct - 15/Oct/2026',
    fechaInicio: '2026-10-09', // Viernes 09/Oct: exactamente 5 días hábiles al 15/Oct
    fechaFin: '2026-10-15',
    dias: 5,
    saldoDisponible: 10,
    comentarios: '',
    fechaSolicitud: '20/Sep/2026',
    estatus: 'Pendiente',
    saldoActualVacaciones: 10,
    esExcepcion: false,
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'SOL-2026-005',
    colaboradorId: 'EMP-05120',
    employeeId: 'EMP-05120',
    colaboradorNombre: 'Sofía Valenzuela Mendoza',
    colaboradorPuesto: 'Diseñadora de Producto UI/UX',
    colaboradorDepto: 'Diseño e Innovación',
    colaboradorEmail: 'svalenzuela@ayvi.com.mx',
    tipo: 'Día Flex',
    fechas: '28/Sep/2026',
    fechaInicio: '2026-09-28',
    fechaFin: '2026-09-28',
    dias: 1,
    saldoDisponible: 2,
    comentarios: 'Día flex para atender trámites personales bancarios y notariales por la mañana. Dejo cubiertos mis entregables de diseño del sprint.',
    fechaSolicitud: '21/Sep/2026',
    estatus: 'Pendiente',
    saldoActualVacaciones: 2,
    esExcepcion: false,
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'SOL-2026-006',
    colaboradorId: 'EMP-05234',
    employeeId: 'EMP-05234',
    colaboradorNombre: 'Carlos Alberto Méndez',
    colaboradorPuesto: 'Ingeniero de Datos & Cloud',
    colaboradorDepto: 'Arquitectura de Datos',
    colaboradorEmail: 'cmendez@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '03/Nov - 07/Nov/2026',
    fechaInicio: '2026-11-03',
    fechaFin: '2026-11-07',
    dias: 4,
    saldoDisponible: 6,
    comentarios: null,
    fechaSolicitud: '22/Sep/2026',
    estatus: 'Pendiente',
    saldoActualVacaciones: 6,
    esExcepcion: false,
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'SOL-2026-007',
    colaboradorId: 'EMP-04981',
    employeeId: 'EMP-04981',
    colaboradorNombre: 'Mariana Rivas Pacheco',
    colaboradorPuesto: 'Especialista de QA & Testing',
    colaboradorDepto: 'Calidad de Software',
    colaboradorEmail: 'mrivas@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '18/Oct - 21/Oct/2026',
    fechaInicio: '2026-10-18',
    fechaFin: '2026-10-21',
    dias: 3,
    saldoDisponible: 0,
    comentarios: 'Solicito autorización por caso de fuerza mayor familiar (cita médica especializada foránea de mi madre). Acordé previamente con Jefatura que los días se tomen como excepción a cuenta de los que se generarán en mi aniversario 2027.',
    fechaSolicitud: '19/Sep/2026',
    estatus: 'Pendiente',
    saldoActualVacaciones: 0,
    esExcepcion: true,
    motivoExcepcion: 'Trámite personal extraordinario respaldado por Jefatura. Saldo a cuenta de aniversario 2027.',
    avatarColor: 'bg-amber-600',
  },
  // Solicitud pasada no aprobada a tiempo: su fecha de inicio ya pasó, por lo que auto-expira
  {
    id: 'SOL-2026-003',
    colaboradorId: 'EMP-05411',
    employeeId: 'EMP-05411',
    colaboradorNombre: 'Raúl Domínguez Soto',
    colaboradorPuesto: 'Desarrollador Mobile iOS',
    colaboradorDepto: 'Ingeniería y TI',
    colaboradorEmail: 'rdominguez@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '10/Sep - 15/Sep/2026',
    fechaInicio: '2026-09-10',
    fechaFin: '2026-09-15',
    dias: 4,
    saldoDisponible: 8,
    comentarios: 'Solicitud no resuelta antes del inicio del descanso programado.',
    fechaSolicitud: '01/Sep/2026',
    estatus: 'Pendiente',
    saldoActualVacaciones: 8,
    esExcepcion: false,
    avatarColor: 'bg-indigo-600',
  },
  // Historial previo resuelto de miembros del equipo
  {
    id: 'SOL-2026-002',
    colaboradorId: 'EMP-05120',
    employeeId: 'EMP-05120',
    colaboradorNombre: 'Sofía Valenzuela Mendoza',
    colaboradorPuesto: 'Diseñadora de Producto UI/UX',
    colaboradorDepto: 'Diseño e Innovación',
    colaboradorEmail: 'svalenzuela@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '14/Ago - 15/Ago/2026',
    fechaInicio: '2026-08-14',
    fechaFin: '2026-08-15',
    dias: 2,
    saldoDisponible: 14,
    comentarios: 'Vacaciones planificadas de verano.',
    fechaSolicitud: '05/Ago/2026',
    estatus: 'Aprobada',
    fechaResolucion: '06/Ago/2026',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'SOL-2026-001',
    colaboradorId: 'EMP-05234',
    employeeId: 'EMP-05234',
    colaboradorNombre: 'Carlos Alberto Méndez',
    colaboradorPuesto: 'Ingeniero de Datos & Cloud',
    colaboradorDepto: 'Arquitectura de Datos',
    colaboradorEmail: 'cmendez@ayvi.com.mx',
    tipo: 'Día Flex',
    fechas: '01/Ago/2026',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-01',
    dias: 1,
    saldoDisponible: 2,
    comentarios: '',
    fechaSolicitud: '28/Jul/2026',
    estatus: 'Rechazada',
    motivoRechazo: 'Coincide con ventana crítica de migración de base de datos a producción.',
    fechaResolucion: '29/Jul/2026',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'SOL-2026-009',
    colaboradorId: 'EMP-05120',
    employeeId: 'EMP-05120',
    colaboradorNombre: 'Sofía Valenzuela Mendoza',
    colaboradorPuesto: 'Diseñadora de Producto UI/UX',
    colaboradorDepto: 'Diseño e Innovación',
    colaboradorEmail: 'svalenzuela@ayvi.com.mx',
    tipo: 'Vacaciones',
    fechas: '12/Nov - 16/Nov/2026',
    fechaInicio: '2026-11-12',
    fechaFin: '2026-11-16',
    dias: 4,
    saldoDisponible: 8,
    comentarios: 'Solicito cancelar estas vacaciones aprobadas debido a la reprogramación del lanzamiento del producto para diciembre.',
    fechaSolicitud: '23/Sep/2026',
    estatus: 'Pendiente de Cancelación (Jefe)',
    esCancelacion: true,
    saldoActualVacaciones: 8,
    esExcepcion: false,
    avatarColor: 'bg-emerald-600',
  },
];

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  currentUser: propCurrentUser,
  onToastFeedback,
  onPendingCountChange,
}) => {
  // 1. DEFINIR EL USUARIO ACTUAL (Sesión activa del supervisor)
  const currentUser: CurrentUser = propCurrentUser || CURRENT_USER_DEFAULT;

  // 2. DATOS CENTRALIZADOS (Estado único de la bandeja de aprobaciones)
  const [solicitudes, setSolicitudes] = useState<SolicitudSubordinado[]>(MOCK_REQUESTS);

  // Modal de Alerta Minimalista Unificado
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Filtros
  const [tabActual, setTabActual] = useState<'pendientes' | 'cancelaciones' | 'historial'>('pendientes');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'Vacaciones' | 'Día Flex'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Estado para el modal de comentarios
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [activeCommentAuthor, setActiveCommentAuthor] = useState<string>('');

  // Estado para el modal de rechazo
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    reason: string;
  }>({
    isOpen: false,
    requestId: null,
    reason: '',
  });

  // Estado para Pases de Excepción (Habilitar Modo Excepción por 24h)
  const [activeTokens, setActiveTokens] = useState<string[]>(['Mariana Rivas']);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('Sofía Valenzuela');

  // PARTE 2: Calendario Dinámico (Navegación de Meses)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Octubre 2026

  const calendarYear = currentDate.getFullYear();
  const calendarMonth = currentDate.getMonth(); // 0..11
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  let firstDayOffset = new Date(calendarYear, calendarMonth, 1).getDay() - 1;
  if (firstDayOffset === -1) firstDayOffset = 6;

  const totalCeldasOcupadas = firstDayOffset + daysInMonth;
  const trailingDays = (7 - (totalCeldasOcupadas % 7)) % 7;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const handleGenerarPase = () => {
    if (!selectedCollaborator) return;
    if (!activeTokens.includes(selectedCollaborator)) {
      setActiveTokens((prev) => [...prev, selectedCollaborator]);
    }
    setAlertModal({
      isOpen: true,
      title: 'Pase Generado',
      message: 'Pase Generado. El colaborador tiene 24 horas para utilizarlo.',
      type: 'success',
    });
  };

  const handleRevocarPase = (colaboradorNombre: string) => {
    setActiveTokens((prev) => prev.filter((item) => item !== colaboradorNombre));
    setAlertModal({
      isOpen: true,
      title: 'Pase Revocado',
      message: 'El pase de excepción ha sido revocado correctamente.',
      type: 'info',
    });
  };

  // LÓGICA DE ESTADO (PASO 5: APROBAR)
  const handleAprobar = (sol: SolicitudSubordinado) => {
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === sol.id
          ? {
              ...item,
              estatus: 'Aprobada',
              fechaResolucion: fechaHoy,
              saldoDisponible: Math.max(0, item.saldoDisponible - item.dias),
              saldoActualVacaciones: Math.max(0, (item.saldoActualVacaciones ?? item.saldoDisponible) - item.dias),
            }
          : item
      )
    );

    setAlertModal({
      isOpen: true,
      title: 'Solicitud Aprobada',
      message: 'El saldo del colaborador ha sido actualizado.',
      type: 'success',
    });
  };

  // LÓGICA: APROBAR CANCELACIÓN
  // Al dar clic, el estatus final pasa a Cancelado, se quita de pendientes
  // y el sistema reincorpora/reembolsa automáticamente los días solicitados al saldo visible del colaborador.
  const handleAprobarCancelacion = (sol: SolicitudSubordinado) => {
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === sol.id
          ? {
              ...item,
              estatus: 'Cancelada',
              esCancelacion: false,
              fechaResolucion: fechaHoy,
              saldoDisponible: item.saldoDisponible + item.dias,
              saldoActualVacaciones: (item.saldoActualVacaciones ?? item.saldoDisponible) + item.dias,
            }
          : item
      )
    );

    setAlertModal({
      isOpen: true,
      title: 'Cancelación Aprobada',
      message: 'El saldo del colaborador ha sido actualizado y los días han sido reembolsados.',
      type: 'success',
    });
  };

  // LÓGICA: RECHAZAR CANCELACIÓN
  // El estatus regresa a Aprobado (la vacación se mantiene activa y los días siguen descontados).
  const handleRechazarCancelacion = (sol: SolicitudSubordinado) => {
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === sol.id
          ? {
              ...item,
              estatus: 'Aprobada',
              esCancelacion: false,
              fechaResolucion: fechaHoy,
            }
          : item
      )
    );

    setAlertModal({
      isOpen: true,
      title: 'Cancelación Rechazada',
      message: 'La vacación se mantiene activa y los días continúan reservados.',
      type: 'info',
    });
  };

  // Abrir Modal de Rechazo pasando el ID de la solicitud
  const handleAbrirRechazo = (sol: SolicitudSubordinado) => {
    setRejectionModal({
      isOpen: true,
      requestId: sol.id,
      reason: '',
    });
  };

  // LÓGICA DE ESTADO: CONFIRMAR RECHAZO CON MOTIVO OBLIGATORIO
  const handleConfirmarRechazo = () => {
    if (!rejectionModal.requestId || rejectionModal.reason.trim().length < 10) return;

    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const reqId = rejectionModal.requestId;

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === reqId
          ? {
              ...item,
              estatus: 'Rechazada',
              motivoRechazo: rejectionModal.reason.trim(),
              fechaResolucion: fechaHoy,
            }
          : item
      )
    );

    setRejectionModal({
      isOpen: false,
      requestId: null,
      reason: '',
    });

    setAlertModal({
      isOpen: true,
      title: 'Solicitud Rechazada',
      message: 'Se ha notificado el motivo del rechazo al colaborador.',
      type: 'error',
    });
  };

  // =========================================================================
  // 3. REGLA DE NEGOCIO: AUTO-EXPIRACIÓN DE SOLICITUDES PENDIENTES
  // Si una solicitud tiene estatus "Pendiente" y su fechaInicio ya pasó
  // (fechaInicio < today), su estatus cambia automáticamente a "Expirado por Sistema".
  // Desaparece de "Pendientes de Aprobación" y se mueve a "Historial Resuelto".
  // =========================================================================
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const solicitudesConAutoExpiracion = React.useMemo(() => {
    return solicitudes.map((sol) => {
      if (sol.estatus === 'Pendiente' && sol.fechaInicio < todayStr) {
        return {
          ...sol,
          estatus: 'Expirado por Sistema' as const,
          fechaResolucion: 'Expirado por Sistema',
        };
      }
      return sol;
    });
  }, [solicitudes, todayStr]);

  // =========================================================================
  // 4. LÓGICA DE FILTRADO (PROTECCIÓN DE SEGURIDAD):
  // El usuario que tiene la sesión activa (el jefe/supervisor) jamás debe aparecer
  // en su propia lista de solicitudes por aprobar. Filtramos por ID de nómina y nombre.
  // =========================================================================
  const filteredApprovals = solicitudesConAutoExpiracion.filter(
    (approval) =>
      approval.colaboradorId !== currentUser.id &&
      approval.employeeId !== currentUser.id &&
      approval.colaboradorNombre.trim().toLowerCase() !== currentUser.name.trim().toLowerCase()
  );

  // Separación de pendientes, cancelaciones e historial basada EXCLUSIVAMENTE en filteredApprovals
  const solicitudesPendientes = filteredApprovals.filter((s) => s.estatus === 'Pendiente');
  const solicitudesCancelacion = filteredApprovals.filter((s) => s.estatus === 'Pendiente de Cancelación (Jefe)');
  const solicitudesHistorial = filteredApprovals.filter(
    (s) => s.estatus !== 'Pendiente' && s.estatus !== 'Pendiente de Cancelación (Jefe)'
  );

  // =========================================================================
  // 5. CALENDARIO CONECTADO AL ARREGLO CENTRAL:
  // Lee este mismo arreglo procesado. Si la solicitud está "Expirada por Sistema",
  // "Cancelada" o "Rechazada", NO se pinta. Excluye fines de semana de las etiquetas.
  // =========================================================================
  const obtenerAusenciasDelDia = (dia: number) => {
    // Excluir fines de semana: Sábados (6) y Domingos (0) son días inhábiles
    const fechaObj = new Date(calendarYear, calendarMonth, dia);
    const dayOfWeek = fechaObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return [];
    }

    const fechaStr = `${calendarYear}-${pad2(calendarMonth + 1)}-${pad2(dia)}`;

    return filteredApprovals
      .filter((sol) => {
        // Excluir solicitudes no vigentes del calendario
        if (
          sol.estatus === 'Rechazada' ||
          sol.estatus === 'Cancelada' ||
          sol.estatus === 'Cancelado' ||
          sol.estatus === 'Expirado por Sistema'
        ) {
          return false;
        }
        return fechaStr >= sol.fechaInicio && fechaStr <= sol.fechaFin;
      })
      .map((sol) => {
        const partes = sol.colaboradorNombre.trim().split(' ');
        const nombreCorto =
          partes.length > 1 ? `${partes[0][0]}. ${partes[1]}` : sol.colaboradorNombre;

        const tipo: 'pendiente' | 'aprobado' =
          sol.estatus === 'Aprobada' ? 'aprobado' : 'pendiente';

        return {
          id: sol.id,
          nombre: nombreCorto,
          nombreCompleto: sol.colaboradorNombre,
          tipo,
        };
      });
  };

  // =========================================================================
  // 4. ACTUALIZACIÓN DE CONTADORES:
  // Todos los totales y tarjetas de resumen se calculan a partir de filteredApprovals
  // =========================================================================
  const totalDiasPendientes = solicitudesPendientes.reduce((acc, curr) => acc + curr.dias, 0);
  const totalDiasCancelacion = solicitudesCancelacion.reduce((acc, curr) => acc + curr.dias, 0);

  // Sincronizar el conteo total de pendientes hacia el componente padre con base en filteredApprovals
  React.useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(solicitudesPendientes.length + solicitudesCancelacion.length);
    }
  }, [solicitudesPendientes.length, solicitudesCancelacion.length, onPendingCountChange]);

  const listaAFiltrar =
    tabActual === 'pendientes'
      ? solicitudesPendientes
      : tabActual === 'cancelaciones'
      ? solicitudesCancelacion
      : solicitudesHistorial;

  const solicitudesFiltradas = listaAFiltrar.filter((s) => {
    const cumpleTipo = filtroTipo === 'todos' || s.tipo === filtroTipo;
    const busq = busqueda.toLowerCase().trim();
    const cumpleBusqueda =
      !busq ||
      s.colaboradorNombre.toLowerCase().includes(busq) ||
      s.id.toLowerCase().includes(busq) ||
      s.colaboradorId.toLowerCase().includes(busq) ||
      (s.employeeId && s.employeeId.toLowerCase().includes(busq)) ||
      s.colaboradorPuesto.toLowerCase().includes(busq);
    return cumpleTipo && cumpleBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Métricas rápidas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <span className="text-[11px] font-medium text-gray-500 block uppercase">
              Pendientes por Aprobar
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {solicitudesPendientes.length}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                {solicitudesPendientes.length > 0 ? 'Requieren acción' : 'Al día'}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <span className="text-[11px] font-medium text-gray-500 block uppercase">
              Solicitudes de Cancelación
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {solicitudesCancelacion.length}
              </span>
              <span className={`text-xs font-medium ${solicitudesCancelacion.length > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                {solicitudesCancelacion.length > 0 ? 'Por autorizar' : 'Sin pendientes'}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <span className="text-[11px] font-medium text-gray-500 block uppercase">
              Total Días Involucrados
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {totalDiasPendientes + totalDiasCancelacion}
              </span>
              <span className="text-xs text-gray-500 font-medium">días hábiles</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <span className="text-[11px] font-medium text-gray-500 block uppercase">
              Total de Solicitudes Activas
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                {solicitudesPendientes.length + solicitudesCancelacion.length}
              </span>
              <span className="text-xs text-gray-500">en bandeja</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles: Pestañas de Vista (Pendientes vs Cancelaciones vs Historial) y Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs principales */}
          <div className="flex flex-wrap items-center gap-2 border-b md:border-b-0 border-gray-100 pb-2 md:pb-0">
            <button
              onClick={() => setTabActual('pendientes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-2 ${
                tabActual === 'pendientes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Pendientes de Aprobación</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tabActual === 'pendientes'
                    ? 'bg-white text-blue-700'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {solicitudesPendientes.length}
              </span>
            </button>

            <button
              onClick={() => setTabActual('cancelaciones')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-2 ${
                tabActual === 'cancelaciones'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Solicitudes de Cancelación</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tabActual === 'cancelaciones'
                    ? 'bg-white text-amber-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {solicitudesCancelacion.length}
              </span>
            </button>

            <button
              onClick={() => setTabActual('historial')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-2 ${
                tabActual === 'historial'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Historial Resuelto</span>
              <span className="text-[10px] text-gray-500 font-mono">
                ({solicitudesHistorial.length})
              </span>
            </button>
          </div>

          {/* Filtros secundarios y Búsqueda */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por colaborador o ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filtroTipo === 'todos'
                    ? 'bg-white font-semibold text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('Vacaciones')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filtroTipo === 'Vacaciones'
                    ? 'bg-white font-semibold text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vacaciones
              </button>
              <button
                onClick={() => setFiltroTipo('Día Flex')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filtroTipo === 'Día Flex'
                    ? 'bg-white font-semibold text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Día Flex
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista / Tabla de Solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            {tabActual === 'pendientes'
              ? 'No hay solicitudes pendientes de aprobación'
              : 'No se encontraron registros en el historial'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {tabActual === 'pendientes'
              ? 'Todas las solicitudes de tu equipo han sido gestionadas puntualmente conforme a las políticas corporativas.'
              : 'A medida que apruebes o rechaces solicitudes, quedarán archivadas aquí para consulta.'}
          </p>
        </div>
      ) : (
        <>
          {/* VISTA DESKTOP: Tabla Corporativa Limpia (Visible en pantallas medianas y grandes) */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs table-auto">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-2.5">Colaborador / Puesto</th>
                    <th className="py-2.5 px-2">Tipo</th>
                    <th className="py-2.5 px-2">Rango de Fechas</th>
                    <th className="py-2.5 px-2">Días</th>
                    <th className="py-2.5 px-2">Saldo Disp.</th>
                    <th className="py-2.5 px-2">Fecha Sol.</th>
                    <th className="py-2.5 px-2">Comentarios</th>
                    <th className="py-2.5 px-2">Estatus</th>
                    <th className="py-2.5 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {solicitudesFiltradas.map((sol) => {
                    const esDeficit = sol.dias > sol.saldoDisponible;

                    return (
                        <tr
                          key={sol.id}
                          className={`transition-colors ${
                            esDeficit
                              ? 'bg-red-50/80 hover:bg-red-100/60 border-l-4 border-l-red-500'
                              : 'hover:bg-gray-50/75'
                          }`}
                        >
                          {/* Colaborador */}
                          <td
                            className={`py-2.5 px-2.5 ${
                              esDeficit ? 'border-l-4 border-l-red-500' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gray-300">
                                {sol.colaboradorNombre
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 flex flex-wrap items-center gap-1">
                                  <span>{sol.colaboradorNombre}</span>
                                  <span className="text-[9px] text-gray-500 font-mono font-normal bg-gray-100 px-1 py-0.2 rounded border border-gray-200">
                                    {sol.colaboradorId}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  {sol.colaboradorPuesto}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tipo */}
                          <td className="py-2.5 px-2">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium text-gray-900">{sol.tipo}</span>
                              {sol.esExcepcion && (
                                <span
                                  className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-1 py-0.2 rounded font-mono font-medium"
                                  title="Solicitud por excepción / Saldo en 0"
                                >
                                  Excepción
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-400 font-mono block">
                              {sol.id}
                            </span>
                          </td>

                          {/* Fechas */}
                          <td className="py-2.5 px-2 font-mono text-gray-800 text-[11px] leading-tight">
                            {sol.fechas}
                          </td>

                          {/* Total de Días */}
                          <td className="py-2.5 px-2 tabular-nums">
                            <span className="inline-block bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 text-[11px] font-semibold whitespace-nowrap">
                              {sol.dias} {sol.dias === 1 ? 'día' : 'días'}
                            </span>
                          </td>

                          {/* Saldo Disponible con Alerta Visual si dias > saldoDisponible */}
                          <td className="py-2.5 px-2 tabular-nums">
                            {esDeficit ? (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span className="text-red-600 font-bold text-[11px] whitespace-nowrap">
                                  {sol.saldoDisponible} {sol.saldoDisponible === 1 ? 'd' : 'días'}
                                </span>
                                <span className="text-[9px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-semibold border border-red-200">
                                  Déficit
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-700 text-[11px] whitespace-nowrap">
                                {sol.saldoDisponible} {sol.saldoDisponible === 1 ? 'día' : 'días'}
                              </span>
                            )}
                          </td>

                          {/* Fecha en que se hizo la solicitud */}
                          <td className="py-2.5 px-2 text-gray-500 text-[11px]">
                            {sol.fechaSolicitud}
                          </td>

                          {/* Comentarios */}
                          <td className="py-2.5 px-2 text-xs">
                            {sol.comentarios && sol.comentarios.trim().length > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveComment(sol.comentarios || null);
                                  setActiveCommentAuthor(`${sol.colaboradorNombre} (${sol.id})`);
                                }}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer transition-colors text-[11px]"
                                title="Ver justificación o comentario del colaborador"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs font-normal">N/A</span>
                            )}
                          </td>

                          {/* Estatus */}
                          <td className="py-2.5 px-2">
                            {sol.estatus === 'Pendiente' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
                                Pendiente
                              </span>
                            )}
                            {sol.estatus === 'Pendiente de Cancelación (Jefe)' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1 animate-pulse"></span>
                                Cancelación
                              </span>
                            )}
                            {sol.estatus === 'Aprobada' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                                Aprobada
                              </span>
                            )}
                            {(sol.estatus === 'Cancelada' || sol.estatus === 'Cancelado') && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1"></span>
                                Cancelada
                              </span>
                            )}
                            {sol.estatus === 'Rechazada' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-800 border border-red-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                                Rechazada
                              </span>
                            )}
                            {sol.estatus === 'Expirado por Sistema' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1"></span>
                                Expirado
                              </span>
                            )}
                          </td>

                          {/* Acciones Requeridas */}
                          <td className="py-2.5 px-2 text-right">
                            {sol.estatus === 'Pendiente' && (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {/* Botón Aprobar: Verde */}
                                <button
                                  type="button"
                                  onClick={() => handleAprobar(sol)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-none transition-colors cursor-pointer"
                                  title="Aprobar solicitud y descontar del saldo visible"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Aprobar</span>
                                </button>

                                {/* Botón Rechazar: Rojo */}
                                <button
                                  type="button"
                                  onClick={() => handleAbrirRechazo(sol)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                                  title="Rechazar solicitud con motivo opcional"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Rechazar</span>
                                </button>
                              </div>
                            )}

                            {sol.estatus === 'Pendiente de Cancelación (Jefe)' && (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {/* Botón Aprobar Cancelación */}
                                <button
                                  type="button"
                                  onClick={() => handleAprobarCancelacion(sol)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-none transition-colors cursor-pointer"
                                  title="Aprobar cancelación y reembolsar los días al saldo visible"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Aprobar</span>
                                </button>

                                {/* Botón Rechazar Cancelación */}
                                <button
                                  type="button"
                                  onClick={() => handleRechazarCancelacion(sol)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                                  title="Rechazar cancelación y mantener los días descontados"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Rechazar</span>
                                </button>
                              </div>
                            )}

                            {sol.estatus !== 'Pendiente' && sol.estatus !== 'Pendiente de Cancelación (Jefe)' && (
                              <div className="text-[11px] text-gray-500 text-right">
                                <span>
                                  {sol.estatus === 'Expirado por Sistema'
                                    ? 'Expirado por Sistema'
                                    : `Resuelto: ${sol.fechaResolucion || 'Procesado'}`}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-3 text-[11px] text-gray-500 flex items-center justify-between">
              <span>Mostrando {solicitudesFiltradas.length} solicitud(es)</span>
              <span>Intelexion Workflow v24.9 · Registro de firmas corporativas</span>
            </div>
          </div>

          {/* VISTA MÓVIL Y TARJETAS: Optimizado para aprobación táctil y rápida desde celular */}
          <div className="md:hidden space-y-3">
            {solicitudesFiltradas.map((sol) => {
              const esDeficit = sol.dias > sol.saldoDisponible;

              return (
                <div
                  key={sol.id}
                  className={`bg-white border rounded-lg p-4 shadow-none transition-colors ${
                    esDeficit
                      ? 'border-red-300 border-l-4 border-l-red-500 bg-red-50/25'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                        {sol.colaboradorNombre
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                          <span>{sol.colaboradorNombre}</span>
                          <span className="text-[10px] text-gray-500 font-mono font-normal bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                            {sol.colaboradorId}
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {sol.colaboradorPuesto}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sol.estatus === 'Pendiente'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : sol.estatus === 'Pendiente de Cancelación (Jefe)'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : sol.estatus === 'Aprobada'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : sol.estatus === 'Cancelada' || sol.estatus === 'Cancelado'
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : sol.estatus === 'Expirado por Sistema'
                            ? 'bg-gray-100 text-gray-700 border border-gray-300'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {sol.estatus === 'Pendiente'
                          ? 'Pendiente'
                          : sol.estatus === 'Pendiente de Cancelación (Jefe)'
                          ? 'Solicitud de Cancelación'
                          : sol.estatus === 'Cancelada' || sol.estatus === 'Cancelado'
                          ? 'Cancelada (Reversada)'
                          : sol.estatus === 'Expirado por Sistema'
                          ? 'Expirado'
                          : sol.estatus}
                      </span>
                      {esDeficit && (
                        <span className="text-[9px] font-bold uppercase text-red-700 bg-red-100 px-1.5 py-0.2 rounded border border-red-200">
                          Déficit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detalles de la solicitud */}
                  <div className="py-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                        Tipo & ID
                      </span>
                      <span className="font-semibold text-gray-900">{sol.tipo}</span>
                      <span className="text-[10px] text-gray-500 font-mono block">
                        {sol.id}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                        Días Solicitados
                      </span>
                      <span className="font-bold text-gray-900 tabular-nums">
                        {sol.dias} {sol.dias === 1 ? 'día' : 'días hábiles'}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded border ${
                        esDeficit
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                        Saldo Disponible
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {esDeficit && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        )}
                        <span
                          className={`tabular-nums ${
                            esDeficit
                              ? 'text-red-600 font-bold'
                              : 'font-semibold text-gray-900'
                          }`}
                        >
                          {sol.saldoDisponible} {sol.saldoDisponible === 1 ? 'día' : 'días'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                        Fecha Solicitud
                      </span>
                      <span className="text-gray-700 font-medium">
                        {sol.fechaSolicitud}
                      </span>
                    </div>

                    <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-gray-400">
                        Comentarios:
                      </span>
                      {sol.comentarios && sol.comentarios.trim().length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveComment(sol.comentarios || null);
                            setActiveCommentAuthor(`${sol.colaboradorNombre} (${sol.id})`);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ver comentario</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </div>

                    <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                        Período Solicitado
                      </span>
                      <span className="font-mono text-gray-900 font-medium">
                        {sol.fechas}
                      </span>
                    </div>
                  </div>

                {/* Acciones claras táctiles para móvil */}
                {sol.estatus === 'Pendiente' ? (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAprobar(sol)}
                      className="w-full py-2.5 px-3 rounded text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAbrirRechazo(sol)}
                      className="w-full py-2.5 px-3 rounded text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                ) : sol.estatus === 'Pendiente de Cancelación (Jefe)' ? (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAprobarCancelacion(sol)}
                      className="w-full py-2.5 px-3 rounded text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar Cancelación</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRechazarCancelacion(sol)}
                      className="w-full py-2.5 px-3 rounded text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 active:bg-red-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar Cancelación</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gray-100 text-center text-[11px] text-gray-500">
                    {sol.estatus === 'Expirado por Sistema'
                      ? 'Expirado por Sistema'
                      : `Resolución registrada el ${sol.fechaResolucion || 'Procesado'}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}

      {/* ========================================================
          SECCIÓN: Calendario de Ausencias del Equipo
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Calendario de Ausencias ({MESES_ESPANOL[calendarMonth]} {calendarYear})
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                    title="Mes anterior"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                    title="Mes siguiente"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Supervisión mensual de descansos programados y detección temprana de empalmes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="text-gray-600 font-medium">Pendientes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shrink-0" />
              <span className="text-gray-600 font-medium">Aprobadas</span>
            </div>
          </div>
        </div>

        {/* Cuadrícula del Calendario (Grid Dinámico) */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {/* Fila de días: Lunes a Domingo */}
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia, idx) => (
            <div
              key={dia}
              className={`${
                idx >= 5
                  ? 'bg-slate-100/90 text-slate-500 font-semibold'
                  : 'bg-gray-50 text-gray-500 font-medium'
              } text-xs text-center py-2`}
            >
              {dia}
            </div>
          ))}

          {/* 1. Celdas vacías iniciales (Desfase de inicio de mes) */}
          {Array.from({ length: firstDayOffset }).map((_, idx) => {
            const esFinDeSemana = idx === 5 || idx === 6;
            return (
              <div
                key={`empty-start-${idx}`}
                className={`${esFinDeSemana ? 'bg-slate-50/60' : 'bg-gray-50/50'} h-24 p-1 border-0`}
                aria-hidden="true"
              />
            );
          })}

          {/* 2. Celdas correspondientes a los días del mes actual */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dia = idx + 1;
            const colIndex = (firstDayOffset + idx) % 7;
            const esFinDeSemana = colIndex === 5 || colIndex === 6;
            const ausencias = obtenerAusenciasDelDia(dia);

            return (
              <div
                key={`day-${dia}`}
                className={`${
                  esFinDeSemana ? 'bg-slate-50' : 'bg-white'
                } h-24 p-1 flex flex-col gap-0.5 overflow-y-auto`}
              >
                <div className="text-right">
                  <span
                    className={`text-xs ${
                      esFinDeSemana ? 'text-slate-400 font-normal' : 'text-gray-600 font-medium'
                    }`}
                  >
                    {dia}
                  </span>
                </div>
                {ausencias.map((ausencia, aIdx) => (
                  <div
                    key={aIdx}
                    className={`${
                      ausencia.tipo === 'pendiente'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    } my-0.5 text-[10px] px-1.5 py-0.5 rounded-sm truncate font-medium shadow-2xs`}
                    title={`${ausencia.nombre} (${
                      ausencia.tipo === 'pendiente' ? 'Pendiente' : 'Aprobada'
                    })`}
                  >
                    {ausencia.nombre}
                  </div>
                ))}
              </div>
            );
          })}

          {/* 3. Celdas vacías finales para completar la última semana */}
          {Array.from({ length: trailingDays }).map((_, idx) => {
            const colIndex = (firstDayOffset + daysInMonth + idx) % 7;
            const esFinDeSemana = colIndex === 5 || colIndex === 6;
            return (
              <div
                key={`empty-end-${idx}`}
                className={`${esFinDeSemana ? 'bg-slate-50/60' : 'bg-gray-50/50'} h-24 p-1 border-0`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SECCIÓN: Herramientas de Jefatura (Zona Administrativa Secundaria)
          ======================================================== */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
             
          </span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Columna Izquierda: Título, Descripción, Select y Botón Outline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-200/80 text-gray-700 rounded border border-gray-300/70 shrink-0">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Pases de Excepción (24h)
                </h4>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Habilita temporalmente el Modo Excepción para que un colaborador de tu equipo pueda registrar solicitudes omitiendo reglas rígidas de anticipación o falta de saldo.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <select
                  value={selectedCollaborator}
                  onChange={(e) => setSelectedCollaborator(e.target.value)}
                  className="text-xs rounded border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-2xs"
                >
                  <option value="Sofía Valenzuela">Sofía Valenzuela (EMP-05120)</option>
                  <option value="Carlos Alberto Méndez">Carlos Alberto Méndez (EMP-05234)</option>
                  <option value="Diego Morales">Diego Morales (EMP-04981)</option>
                  <option value="Mariana Rivas">Mariana Rivas (EMP-04812)</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerarPase}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Key className="w-3.5 h-3.5 text-gray-500" />
                  <span>Generar Pase</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Pases Activos Hoy */}
            <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Pases Activos Hoy
                </h5>
                <span className="text-[10px] text-gray-400 font-medium">
                  {activeTokens.length} activo(s)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeTokens.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1">
                    No hay pases temporales activos en este momento.
                  </p>
                ) : (
                  activeTokens.map((colab) => (
                    <span
                      key={colab}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs"
                    >
                      <span className="text-[10px]">✅</span>
                      <span className="font-semibold text-emerald-950">{colab}</span>
                      <span className="text-emerald-700 font-mono text-[10px]">
                        (Expira hoy 23:59)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevocarPase(colab)}
                        className="ml-1 text-emerald-600 hover:text-red-600 font-bold text-xs cursor-pointer transition-colors"
                        title="Revocar pase"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: Rechazar Solicitud con Motivo (UI Centrado)
          ======================================================== */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800">
              Rechazar Solicitud
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Por favor, indica el motivo del rechazo. Este mensaje será enviado al colaborador.
            </p>

            <div className="mt-4">
              <textarea
                rows={4}
                value={rejectionModal.reason}
                onChange={(e) =>
                  setRejectionModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Escribe el motivo del rechazo (mínimo 10 caracteres)..."
                className="w-full text-xs rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[11px]">
                  {rejectionModal.reason.trim().length < 10 ? (
                    <span className="text-amber-600 font-medium">
                      Mínimo 10 caracteres ({rejectionModal.reason.trim().length}/10)
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">
                      {rejectionModal.reason.trim().length} caracteres ingresados
                    </span>
                  )}
                </span>
                {rejectionModal.requestId && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {rejectionModal.requestId}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setRejectionModal({ isOpen: false, requestId: null, reason: '' })
                }
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={rejectionModal.reason.trim().length < 10}
                onClick={handleConfirmarRechazo}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Ver Comentarios / Justificación de la Solicitud
          ======================================================== */}
      {activeComment && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setActiveComment(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-5 shadow-lg animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Comentario de la Solicitud
                  </h4>
                  {activeCommentAuthor && (
                    <p className="text-xs text-gray-500 font-medium">
                      {activeCommentAuthor}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveComment(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido / Cuerpo del comentario */}
            <div className="py-4">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Justificación del Colaborador:
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                "{activeComment}"
              </div>
            </div>

            {/* Pie del modal con botón Cerrar */}
            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveComment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta Minimalista Unificado */}
      <MinimalAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ApprovalsView;
