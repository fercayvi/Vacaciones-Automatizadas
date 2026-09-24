import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Info,
  Building2,
  FileText,
  HelpCircle,
  Briefcase,
  X
} from 'lucide-react';
import ApprovalsView from './ApprovalsView';

interface Solicitud {
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

export default function App() {
  // Manejo de Vistas (VISTA 1: Login, VISTA 2: Dashboard)
  const [vistaActual, setVistaActual] = useState<'login' | 'dashboard'>('login');

  // Pestaña Activa en el Dashboard: 'mis-solicitudes' (Colaborador) | 'aprobaciones' (Jefe Directo)
  const [pestanaActiva, setPestanaActiva] = useState<'mis-solicitudes' | 'aprobaciones'>('mis-solicitudes');
  const [conteoPendientesJefe, setConteoPendientesJefe] = useState(4);

  // Estado del Formulario de Login
  const [loginEmail, setLoginEmail] = useState('fecarrillo@ayvi.com.mx');
  const [loginPassword, setLoginPassword] = useState('••••••••••');

  // Datos del colaborador (Intelexion HR)
  const colaborador = {
    nombre: 'Fernando Carrillo',
    puesto: 'Desarrollador Senior Frontend',
    numEmpleado: 'EMP-04829',
    jefeDirecto: 'Lic. Rodrigo Mendoza',
    puestoJefe: 'Director de Ingeniería y TI',
    fechaAniversario: '14 de Marzo, 2021',
    antiguedad: '3 años, 6 meses',
    departamento: 'Tecnología e Innovación Digital',
    empresa: 'Grupo Ayvi Soluciones S.A. de C.V.',
  };

  // Saldos base
  const [saldoVacaciones, setSaldoVacaciones] = useState({
    totalDays: 5,
    previousPeriod: {
      days: 1,
      periodName: 'Período 2024 - 2025',
      expirationDate: '14/Sep/2026',
    },
    currentPeriod: {
      days: 4,
      periodName: 'Período 2025 - 2026',
      expirationDate: '14/Sep/2027',
    },
  });
  const [diasFlexAsignados, setDiasFlexAsignados] = useState(3);

  // Historial de solicitudes (con los datos requeridos por la especificación)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    {
      id: 'SOL-2026-005',
      tipo: 'Vacaciones',
      fechas: '16/Nov - 20/Nov',
      fechaInicio: '2026-11-16',
      fechaFin: '2026-11-20',
      dias: 5,
      estatus: 'Aprobado',
      esExcepcion: false,
      fechaRegistro: '18/Sep/2026',
    },
    {
      id: 'SOL-2026-004',
      tipo: 'Vacaciones',
      fechas: '10/Oct - 15/Oct',
      fechaInicio: '2026-10-10',
      fechaFin: '2026-10-15',
      dias: 5,
      estatus: 'Pendiente de Aprobación (Jefe)',
      esExcepcion: false,
      fechaRegistro: '20/Sep/2026',
    },
    {
      id: 'SOL-2026-003',
      tipo: 'Día Flex',
      fechas: '20/Sep',
      fechaInicio: '2026-09-20',
      fechaFin: '2026-09-20',
      dias: 1,
      estatus: 'Aprobado',
      esExcepcion: false,
      fechaRegistro: '12/Sep/2026',
    },
    {
      id: 'SOL-2026-002',
      tipo: 'Vacaciones',
      fechas: '15/Jul - 19/Jul',
      fechaInicio: '2026-07-15',
      fechaFin: '2026-07-19',
      dias: 5,
      estatus: 'Aprobado',
      esExcepcion: false,
      fechaRegistro: '01/Jul/2026',
    },
    {
      id: 'SOL-2026-001',
      tipo: 'Día Flex',
      fechas: '14/Feb',
      fechaInicio: '2026-02-14',
      fechaFin: '2026-02-14',
      dias: 1,
      estatus: 'Aprobado',
      esExcepcion: false,
      fechaRegistro: '05/Feb/2026',
    },
  ]);

  // Cálculos dinámicos de saldo
  // Días de vacaciones en estatus "Pendiente"
  const diasPendientesVacaciones = solicitudes
    .filter((s) => s.tipo === 'Vacaciones' && s.estatus === 'Pendiente de Aprobación (Jefe)')
    .reduce((acc, curr) => acc + curr.dias, 0);

  // Días de vacaciones ya aprobados (o con cancelación en trámite) y disfrutados o comprometidos en el período
  const diasAprobadosVacaciones = solicitudes
    .filter(
      (s) =>
        s.tipo === 'Vacaciones' &&
        (s.estatus === 'Aprobado' || s.estatus === 'Pendiente de Cancelación (Jefe)')
    )
    .reduce((acc, curr) => acc + curr.dias, 0);

  // Saldo visual disponible de vacaciones
  const saldoVacacionesCalculado = saldoVacaciones.totalDays;

  // Días Flex disponibles
  const diasFlexUsados = solicitudes
    .filter(
      (s) =>
        s.tipo === 'Día Flex' &&
        (s.estatus === 'Aprobado' ||
          s.estatus === 'Pendiente de Aprobación (Jefe)' ||
          s.estatus === 'Pendiente de Cancelación (Jefe)')
    )
    .reduce((acc, curr) => acc + curr.dias, 0);
  const saldoFlexCalculado = Math.max(0, diasFlexAsignados - diasFlexUsados);

  // Estado del formulario de Nueva Solicitud
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Vacaciones' | 'Día Flex'>('Vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isExceptionMode, setIsExceptionMode] = useState(false);
  const [justification, setJustification] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState<{ tipo: 'exito' | 'error' | 'info'; texto: string } | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [modalEdicion, setModalEdicion] = useState<Solicitud | null>(null);
  const [modalConfirmarReversar, setModalConfirmarReversar] = useState<Solicitud | null>(null);
  const [modalTabuladorVacaciones, setModalTabuladorVacaciones] = useState(false);
  const [modalPoliticaFlex, setModalPoliticaFlex] = useState(false);
  const [filtroEstatus, setFiltroEstatus] = useState<'todos' | 'pendientes' | 'aprobados'>('todos');
  const [formError, setFormError] = useState<string | null>(null);

  // Manejador del Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Al hacer clic, sin importar lo que se escriba, cambia a la Vista 2
    setVistaActual('dashboard');
    setMensajeFeedback({
      tipo: 'info',
      texto: 'Bienvenido de nuevo, Fernando. Sesión iniciada con credenciales corporativas.',
    });
    setTimeout(() => {
      setMensajeFeedback(null);
    }, 4500);
  };

  // Manejador de Cerrar Sesión
  const handleLogout = () => {
    setVistaActual('login');
    setMensajeFeedback(null);
  };

  // Cálculo de días estimados entre fechaInicio y fechaFin
  const calcularDiasHabiles = (inicio: string, fin: string) => {
    if (!inicio) return 0;
    if (!fin) return 1;
    const start = new Date(inicio);
    const end = new Date(fin);
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

  // Formatear fechas para mostrar en la tabla (ej. 10/Oct - 15/Oct)
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

  // Enviar Nueva Solicitud
  const handleEnviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fechaInicio) {
      setMensajeFeedback({ tipo: 'error', texto: 'Por favor selecciona la fecha de inicio.' });
      return;
    }

    // Regla Días Flex: Calcular diferencia entre fecha de inicio y fecha de fin
    if (tipoSeleccionado === 'Día Flex') {
      const fechaFinEfectiva = fechaFin || fechaInicio;
      const dInicio = new Date(fechaInicio + 'T00:00:00');
      const dFin = new Date(fechaFinEfectiva + 'T00:00:00');
      const diffTime = dFin.getTime() - dInicio.getTime();
      const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDias > 1) {
        setFormError(
          'Error: Los Días Flex son individuales y no pueden tomarse de forma consecutiva. Selecciona solo un día.'
        );
        return;
      }
    }

    if (tipoSeleccionado === 'Vacaciones' && !fechaFin) {
      setMensajeFeedback({ tipo: 'error', texto: 'Por favor selecciona la fecha de fin de vacaciones.' });
      return;
    }

    const finFinal = tipoSeleccionado === 'Día Flex' ? fechaInicio : fechaFin;
    const diasTotal = tipoSeleccionado === 'Día Flex' ? 1 : diasCalculados;

    if (diasTotal <= 0) {
      setMensajeFeedback({ tipo: 'error', texto: 'El rango de fechas seleccionado no contiene días hábiles válidos.' });
      return;
    }

    // LÓGICA DE VALIDACIÓN (Reglas Normales vs Modo Excepción):
    if (!isExceptionMode) {
      // Regla 1: Validar que la fecha de inicio sea al menos 7 días desde hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicioDate = new Date(fechaInicio + 'T00:00:00');
      const diffTime = inicioDate.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDias < 7) {
        setMensajeFeedback({
          tipo: 'error',
          texto: 'Las solicitudes regulares requieren al menos 7 días de anticipación. Para tramitar con menor tiempo, activa el Modo Excepción.',
        });
        return;
      }

      // Regla 2: Validar que el saldo sea suficiente
      const saldoDisponible = tipoSeleccionado === 'Vacaciones' ? saldoVacacionesCalculado : saldoFlexCalculado;
      if (diasTotal > saldoDisponible) {
        setMensajeFeedback({
          tipo: 'error',
          texto: `Saldo insuficiente (${saldoDisponible} ${saldoDisponible === 1 ? 'día disponible' : 'días disponibles'} vs ${diasTotal} solicitados). Para tramitar sin saldo, activa el Modo Excepción.`,
        });
        return;
      }

      // Regla 3: No permitir Días Flex consecutivos
      if (tipoSeleccionado === 'Día Flex') {
        const tieneConsecutivo = solicitudes.some((s) => {
          if (s.tipo !== 'Día Flex' || s.estatus === 'Cancelada (Reversada)') return false;
          const sDate = new Date(s.fechaInicio + 'T00:00:00');
          const diff = Math.abs(Math.round((inicioDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
          return diff <= 1;
        });

        if (tieneConsecutivo) {
          setMensajeFeedback({
            tipo: 'error',
            texto: 'Por política de la empresa no se permiten Días Flex consecutivos. Para casos extraordinarios, activa el Modo Excepción.',
          });
          return;
        }
      }
    } else {
      // Modo Excepción: Se omiten las reglas de anticipación, saldos y días consecutivos.
      // Pero la justificación es obligatoria y debe tener al menos 10 caracteres.
      if (!justification || justification.trim().length < 10) {
        setMensajeFeedback({
          tipo: 'error',
          texto: 'La justificación es obligatoria para el Modo Excepción y debe tener al menos 10 caracteres.',
        });
        return;
      }
    }

    // Crear solicitud
    const nuevaSol: Solicitud = {
      id: `SOL-2026-00${solicitudes.length + 2}`,
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

    setSolicitudes([nuevaSol, ...solicitudes]);
    setMensajeFeedback({
      tipo: 'exito',
      texto: isExceptionMode
        ? `Solicitud por Excepción ${nuevaSol.id} registrada. Enviada a ${colaborador.jefeDirecto} para su revisión manual obligatoria.`
        : `Solicitud ${nuevaSol.id} registrada con éxito. Notificación enviada a ${colaborador.jefeDirecto} para su revisión.`,
    });

    // Reset de formulario
    setFechaInicio('');
    setFechaFin('');
    setJustification('');
    setIsExceptionMode(false);

    setTimeout(() => {
      setMensajeFeedback(null);
    }, 6000);
  };

  // Fecha actual del sistema para validación de vigencia (23 de Septiembre de 2026)
  const FECHA_ACTUAL_SISTEMA = '2026-09-23';

  // Regla 1: Bloqueo de Cancelación por Fechas Transcurridas (Fechas Pasadas)
  // Compara la fecha de fin de la solicitud (fechaFin) contra la fecha actual (today).
  // Si la fecha ya pasó (fechaFin < today), no es cancelable.
  const esFechaTranscurrida = (fechaFinStr: string) => {
    if (!fechaFinStr) return false;
    return fechaFinStr < FECHA_ACTUAL_SISTEMA;
  };

  // Regla 2: Solicitud de Cancelación (Requiere Aprobación del Jefe)
  // Cuando un colaborador hace clic en "Cancelar Solicitud":
  // No se cancela inmediatamente. El estatus de la solicitud cambia a 'Pendiente de Cancelación (Jefe)'.
  const handleSolicitarCancelacion = (sol: Solicitud) => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === sol.id
          ? { ...item, estatus: 'Pendiente de Cancelación (Jefe)' }
          : item
      )
    );
    setModalConfirmarReversar(null);
    setMensajeFeedback({
      tipo: 'info',
      texto: `Solicitud de cancelación para ${sol.id} enviada a ${colaborador.jefeDirecto} para su revisión.`,
    });
    setTimeout(() => setMensajeFeedback(null), 5000);
  };

  // Reversar / Cancelar solicitud aprobada (fallback directo para administradores)
  const ejecutarReverso = (sol: Solicitud) => {
    setSolicitudes(
      solicitudes.map((item) =>
        item.id === sol.id ? { ...item, estatus: 'Cancelada (Reversada)' } : item
      )
    );
    setModalConfirmarReversar(null);
    setMensajeFeedback({
      tipo: 'info',
      texto: `La solicitud ${sol.id} (${sol.tipo}) ha sido cancelada y los días correspondientes fueron reversados a tu saldo.`,
    });
    setTimeout(() => setMensajeFeedback(null), 5000);
  };

  // Guardar edición de solicitud pendiente
  const guardarEdicion = (solActualizada: Solicitud) => {
    setSolicitudes(
      solicitudes.map((item) => (item.id === solActualizada.id ? solActualizada : item))
    );
    setModalEdicion(null);
    setMensajeFeedback({
      tipo: 'exito',
      texto: `Solicitud ${solActualizada.id} actualizada correctamente.`,
    });
    setTimeout(() => setMensajeFeedback(null), 4000);
  };

  // Simulación de sincronización con Intelexion
  const handleSincronizarIntelexion = () => {
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      setMensajeFeedback({
        tipo: 'exito',
        texto: 'Saldos y registros sincronizados exitosamente con Intelexion HR v24.9.',
      });
      setTimeout(() => setMensajeFeedback(null), 4000);
    }, 800);
  };

  // ==========================================
  // VISTA 1: Interfaz de Inicio de Sesión
  // ==========================================
  if (vistaActual === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Tarjeta de Login */}
          <div className="bg-white py-8 px-6 border border-gray-200 rounded-lg sm:px-10">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6 text-center">
              Iniciar Sesión
            </h2>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="colaborador@empresa.com"
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    Contraseña
                  </label>
                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Para restablecer tus accesos corporativos, contacta a la mesa de ayuda de TI (soporte@ayvi.com.mx).');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600">
                    Recordar sesión en este equipo
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  Ingresar
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: Dashboard Principal de Vacaciones
  // ==========================================
  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (filtroEstatus === 'todos') return true;
    if (filtroEstatus === 'pendientes') return s.estatus.toLowerCase().includes('pendiente');
    if (filtroEstatus === 'aprobados') return s.estatus === 'Aprobado';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Barra de Navegación Superior Corporativa (Top Bar Contract: 3 zonas) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Perfil del Colaborador con No. de Nómina y Cerrar Sesión */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                FC
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-tight">
                  {colaborador.nombre}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  No. Nómina: {colaborador.numEmpleado}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded transition-colors cursor-pointer"
                title="Cerrar sesión actual"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

            {/* Enlaces de navegación con pestañas Colaborador / Jefe Directo */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => setPestanaActiva('mis-solicitudes')}
                className={`py-5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  pestanaActiva === 'mis-solicitudes'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                }`}
              >
                <span>Mis Solicitudes y Saldos</span>
              </button>

              <button
                type="button"
                onClick={() => setPestanaActiva('aprobaciones')}
                className={`py-5 transition-colors cursor-pointer flex items-center gap-2 ${
                  pestanaActiva === 'aprobaciones'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                }`}
              >
                <span>Aprobaciones</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {conteoPendientesJefe}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Barra de Pestañas Móvil (Responsiva para teléfonos de jefes) */}
        <div className="md:hidden border-t border-gray-200 px-4 py-2 flex items-center gap-2 bg-gray-50">
          <button
            type="button"
            onClick={() => setPestanaActiva('mis-solicitudes')}
            className={`flex-1 py-2 text-xs font-semibold rounded text-center transition-colors cursor-pointer ${
              pestanaActiva === 'mis-solicitudes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Mis Solicitudes
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('aprobaciones')}
            className={`flex-1 py-2 text-xs font-semibold rounded text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              pestanaActiva === 'aprobaciones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <span>Aprobaciones</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                pestanaActiva === 'aprobaciones'
                  ? 'bg-white text-blue-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {conteoPendientesJefe}
            </span>
          </button>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Feedback / Alertas del sistema */}
        {mensajeFeedback && (
          <div
            className={`mb-6 p-4 rounded border text-sm flex items-start justify-between ${
              mensajeFeedback.tipo === 'exito'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : mensajeFeedback.tipo === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {mensajeFeedback.tipo === 'exito' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              )}
              {mensajeFeedback.tipo === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              )}
              {mensajeFeedback.tipo === 'info' && (
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              )}
              <span>{mensajeFeedback.texto}</span>
            </div>
            <button
              onClick={() => setMensajeFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer ml-4 font-semibold"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Contenido condicional según la pestaña seleccionada */}
        {pestanaActiva === 'mis-solicitudes' ? (
          <>
            {/* ========================================================
                SECCIÓN A: Resumen de Saldos (Lectura de "Intelexion" simulada)
                ======================================================== */}
        <section className="mb-8" aria-label="Resumen de Saldos">
          {/* Cabecera de perfil */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-gray-100 text-gray-700 rounded border border-gray-200 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {colaborador.nombre}
                    </h2>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-mono">
                      {colaborador.numEmpleado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {colaborador.puesto} · {colaborador.departamento}
                  </p>
                </div>
              </div>

              {/* Metadatos institucionales: Jefe Directo y Fecha de Aniversario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 text-xs">
                <div className="bg-gray-50 border border-gray-200 rounded p-2.5">
                  <span className="text-gray-500 block font-medium">Jefe Directo Asignado:</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {colaborador.jefeDirecto}
                  </span>
                  <span className="text-[11px] text-gray-500">{colaborador.puestoJefe}</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2.5">
                  <span className="text-gray-500 block font-medium">Fecha de Aniversario:</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {colaborador.fechaAniversario}
                  </span>
                  <span className="text-[11px] text-gray-500">Antigüedad: {colaborador.antiguedad}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Saldo (2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tarjeta 1: Saldo de Vacaciones */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                {/* Encabezado de la Tarjeta con Botón de Información */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Saldo de Vacaciones
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalTabuladorVacaciones(true)}
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer"
                    title="Ver Tabulador Oficial de Vacaciones (LFT)"
                    aria-label="Ver Tabulador Oficial de Vacaciones (LFT)"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Total general en grande */}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {saldoVacaciones.totalDays}
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    días totales disponibles
                  </span>
                </div>

                {/* División Visual de los Saldos (UI) */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Caja 1 (Período Anterior - Urgente) */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-orange-950 block">
                        {saldoVacaciones.previousPeriod.periodName}
                      </span>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-orange-900 tabular-nums">
                          {saldoVacaciones.previousPeriod.days}
                        </span>
                        <span className="text-xs font-medium text-orange-800">
                          {saldoVacaciones.previousPeriod.days === 1 ? 'día disponible' : 'días disponibles'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-orange-200/70">
                      <span className="text-xs font-semibold text-orange-800 inline-flex items-center gap-1">
                        <span>Vence el:</span>
                        <span className="font-mono font-bold">{saldoVacaciones.previousPeriod.expirationDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Caja 2 (Período Actual - Regular) */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block">
                        {saldoVacaciones.currentPeriod.periodName}
                      </span>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-gray-900 tabular-nums">
                          {saldoVacaciones.currentPeriod.days}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {saldoVacaciones.currentPeriod.days === 1 ? 'día disponible' : 'días disponibles'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600 inline-flex items-center gap-1">
                        <span>Vence el:</span>
                        <span className="font-mono font-medium text-gray-800">{saldoVacaciones.currentPeriod.expirationDate}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Saldo de Días Flex */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Saldo de Días Flex
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalPoliticaFlex(true)}
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer"
                    title="Ver Política de Beneficio Días Flex"
                    aria-label="Ver Política de Beneficio Días Flex"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {saldoFlexCalculado}
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    {saldoFlexCalculado === 1 ? 'día disponible' : 'días disponibles'}
                  </span>
                </div>

                {/* Contenedor ajustado al texto */}
                <div className="mt-4 w-fit bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center">
                  <span className="text-xs text-gray-600 inline-flex items-center gap-1">
                    <span>Vence el:</span>
                    <span className="font-mono font-medium text-gray-800">31/Dic/2026</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout en Grid para Sección B (Formulario) y Sección C (Historial) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================
              SECCIÓN B: Nueva Solicitud (Formulario Inteligente)
              ======================================================== */}
          <section className="lg:col-span-5" aria-label="Nueva Solicitud">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="border-b border-gray-100 pb-3 mb-5">
                <h3 className="text-base font-bold text-gray-900">
                  Nueva Solicitud
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Completa el formulario para enviar a revisión de tu jefatura.
                </p>
              </div>

              <form onSubmit={handleEnviarSolicitud} className="space-y-4">
                {/* Selector de Tipo: "Vacaciones" o "Día Flex" */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Tipo de Solicitud
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoSeleccionado('Vacaciones');
                        if (formError) setFormError(null);
                      }}
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
                      onClick={() => {
                        setTipoSeleccionado('Día Flex');
                        if (formError) setFormError(null);
                      }}
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
                        if (formError) setFormError(null);
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
                      onChange={(e) => {
                        setFechaFin(e.target.value);
                        if (formError) setFormError(null);
                      }}
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
                    {/* Banner de alerta requerido */}
                    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Las solicitudes por excepción requieren revisión detallada y aprobación manual obligatoria por parte de tu Jefatura.
                      </p>
                    </div>

                    {/* Textarea de Justificación (Obligatoria) */}
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

                {/* Botón de envío requerido: "Enviar Solicitud al Jefe Directo" */}
                <div className="pt-3">
                  {(() => {
                    const isSubmitDisabled = isExceptionMode && justification.trim().length < 10;
                    return (
                      <>
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

                        {/* Banner de error de validación visual para Días Flex u otras reglas */}
                        {formError && (
                          <div className="mt-3 bg-red-50 text-red-700 border-l-4 border-red-500 p-3 rounded text-xs flex items-start gap-2 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{formError}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </form>
            </div>
          </section>

          {/* ========================================================
              SECCIÓN C: Historial y Estatus (Tabla minimalista)
              ======================================================== */}
          <section className="lg:col-span-7" aria-label="Historial y Estatus">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header de la tarjeta */}
              <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Historial y Estatus de Solicitudes
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seguimiento en tiempo real de permisos y vacaciones tramitados
                  </p>
                </div>

                {/* Filtro sutil */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200 text-xs">
                  <button
                    onClick={() => setFiltroEstatus('todos')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      filtroEstatus === 'todos'
                        ? 'bg-white text-gray-900 font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstatus('pendientes')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      filtroEstatus === 'pendientes'
                        ? 'bg-white text-gray-900 font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pendientes
                  </button>
                  <button
                    onClick={() => setFiltroEstatus('aprobados')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      filtroEstatus === 'aprobados'
                        ? 'bg-white text-gray-900 font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Aprobados
                  </button>
                </div>
              </div>

              {/* Tabla optimizada en espacio sin scroll horizontal forzado */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Fechas</th>
                      <th className="py-2.5 px-3">Días</th>
                      <th className="py-2.5 px-3">Estatus</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {solicitudesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No hay solicitudes pendientes en este momento.
                        </td>
                      </tr>
                    ) : (
                      solicitudesFiltradas.map((sol) => (
                        <tr key={sol.id} className="hover:bg-gray-50/75 transition-colors">
                          {/* Columna Tipo */}
                          <td className="py-2 px-3 font-medium text-gray-900">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{sol.tipo}</span>
                              {sol.esExcepcion && (
                                <span
                                  className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-1 py-0.2 rounded font-mono"
                                  title={`Motivo: ${sol.motivo || 'Excepción'}`}
                                >
                                  Excepción
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {sol.id}
                            </span>
                          </td>

                          {/* Columna Fechas */}
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap font-mono text-xs">
                            {sol.fechas}
                          </td>

                          {/* Columna Días solicitados */}
                          <td className="py-2 px-3 text-gray-900 whitespace-nowrap font-medium tabular-nums text-xs">
                            {sol.dias} {sol.dias === 1 ? 'día' : 'días'}
                          </td>

                          {/* Columna Estatus (Badges compactos sin "Jefe") */}
                          <td className="py-2 px-3 whitespace-nowrap">
                            {sol.estatus === 'Pendiente de Aprobación (Jefe)' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                                Pendiente de Aprobación
                              </span>
                            )}

                            {sol.estatus === 'Pendiente de Cancelación (Jefe)' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse"></span>
                                Pendiente de Cancelación
                              </span>
                            )}

                            {sol.estatus === 'Aprobado' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                Aprobado
                              </span>
                            )}

                            {sol.estatus === 'Cancelada (Reversada)' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                                Cancelada
                              </span>
                            )}
                          </td>

                          {/* Columna Acciones */}
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            {sol.estatus === 'Pendiente de Aprobación (Jefe)' && (
                              <div className="inline-flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => setModalEdicion(sol)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                                >
                                  Editar
                                </button>
                                {esFechaTranscurrida(sol.fechaFin) ? (
                                  <span className="text-xs text-gray-400 italic">Fecha transcurrida</span>
                                ) : (
                                  <button
                                    onClick={() => setModalConfirmarReversar(sol)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline cursor-pointer"
                                  >
                                    Cancelar Solicitud
                                  </button>
                                )}
                              </div>
                            )}

                            {sol.estatus === 'Aprobado' && (
                              esFechaTranscurrida(sol.fechaFin) ? (
                                <span className="text-xs text-gray-400 italic">Fecha transcurrida</span>
                              ) : (
                                <button
                                  onClick={() => setModalConfirmarReversar(sol)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline cursor-pointer"
                                >
                                  Cancelar Solicitud
                                </button>
                              )
                            )}

                            {sol.estatus === 'Pendiente de Cancelación (Jefe)' && (
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                Cancelación en revisión
                              </span>
                            )}

                            {sol.estatus === 'Cancelada (Reversada)' && (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pie de tabla con información explicativa */}
              <div className="bg-gray-50 border-t border-gray-200 p-3 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                  Mostrando {solicitudesFiltradas.length} registro(s) activos
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  
                </span>
              </div>
            </div>
          </section>
        </div>
      </>
    ) : (
      <ApprovalsView
        currentUser={{
          id: colaborador.numEmpleado,
          name: colaborador.nombre,
          email: loginEmail,
          role: 'Supervisor / Jefe Directo',
        }}
        onToastFeedback={(tipo, texto) => setMensajeFeedback({ tipo, texto })}
        onPendingCountChange={(cant) => setConteoPendientesJefe(cant)}
      />
    )}
  </main>

      {/* ========================================================
          MODAL: Solicitar Cancelación al Jefe Directo
          ======================================================== */}
      {modalConfirmarReversar && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 shadow-none">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  ¿Solicitar cancelación de esta solicitud?
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Estás a punto de solicitar la cancelación de tu solicitud de{' '}
                  <strong className="text-gray-900">{modalConfirmarReversar.tipo}</strong> ({modalConfirmarReversar.fechas}).
                </p>
                <div className="mt-3 bg-amber-50/75 border border-amber-200 rounded p-2.5 text-xs text-amber-950 space-y-1.5">
                  <p>
                    <strong>Aprobación requerida:</strong> La solicitud pasará a estatus{' '}
                    <span className="font-semibold text-amber-800">Pendiente de Cancelación (Jefe)</span> y será revisada por tu jefe directo (
                    <span className="font-semibold text-gray-900">{colaborador.jefeDirecto}</span>).
                  </p>
                  <p className="text-[11px] text-amber-900">
                    Al ser aprobada la cancelación, el sistema reembolsará automáticamente{' '}
                    <strong>{modalConfirmarReversar.dias} día(s)</strong> a tu saldo visible.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalConfirmarReversar(null)}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
              >
                No, mantener activa
              </button>
              <button
                type="button"
                onClick={() => handleSolicitarCancelacion(modalConfirmarReversar)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded cursor-pointer transition-colors"
              >
                Confirmar Solicitud de Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Editar Solicitud Pendiente
          ======================================================== */}
      {modalEdicion && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 shadow-none">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Editar Solicitud Pendiente ({modalEdicion.id})
                </h4>
                <p className="text-xs text-gray-500">
                  Modifica las fechas o datos antes de que sea evaluada por {colaborador.jefeDirecto}
                </p>
              </div>
              <button
                onClick={() => setModalEdicion(null)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                guardarEdicion(modalEdicion);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Tipo de Solicitud
                </label>
                <input
                  type="text"
                  disabled
                  value={modalEdicion.tipo}
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={modalEdicion.fechaInicio}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const newDias =
                        modalEdicion.tipo === 'Día Flex'
                          ? 1
                          : calcularDiasHabiles(newStart, modalEdicion.fechaFin);
                      setModalEdicion({
                        ...modalEdicion,
                        fechaInicio: newStart,
                        fechaFin: modalEdicion.tipo === 'Día Flex' ? newStart : modalEdicion.fechaFin,
                        fechas: formatearRangoFechas(
                          newStart,
                          modalEdicion.tipo === 'Día Flex' ? newStart : modalEdicion.fechaFin
                        ),
                        dias: newDias,
                      });
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    required={modalEdicion.tipo === 'Vacaciones'}
                    disabled={modalEdicion.tipo === 'Día Flex'}
                    value={modalEdicion.fechaFin}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const newDias = calcularDiasHabiles(modalEdicion.fechaInicio, newEnd);
                      setModalEdicion({
                        ...modalEdicion,
                        fechaFin: newEnd,
                        fechas: formatearRangoFechas(modalEdicion.fechaInicio, newEnd),
                        dias: newDias,
                      });
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-600 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-gray-700 flex justify-between font-mono">
                <span>Días totales recalculados:</span>
                <span className="font-bold text-gray-900">{modalEdicion.dias} días</span>
              </div>

              {modalEdicion.esExcepcion && (
                <div>
                  <label className="block font-semibold text-red-700 mb-1">
                    Motivo de la excepción
                  </label>
                  <textarea
                    rows={2}
                    value={modalEdicion.motivo || ''}
                    onChange={(e) =>
                      setModalEdicion({ ...modalEdicion, motivo: e.target.value })
                    }
                    className="w-full border border-red-300 rounded p-2 text-gray-900 bg-red-50/20"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    // Descartar solicitud
                    setSolicitudes(solicitudes.filter((s) => s.id !== modalEdicion.id));
                    setModalEdicion(null);
                    setMensajeFeedback({
                      tipo: 'info',
                      texto: `Solicitud ${modalEdicion.id} eliminada.`,
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline cursor-pointer"
                >
                  Eliminar solicitud
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalEdicion(null)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer font-medium"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Tabulador Oficial de Vacaciones (LFT)
          ======================================================== */}
      {modalTabuladorVacaciones && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setModalTabuladorVacaciones(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    Tabulador Oficial de Vacaciones (LFT)
                  </h4>
                  <p className="text-xs text-gray-500">Ley Federal del Trabajo (México)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTabuladorVacaciones(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-pointer transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabla de 2 Columnas (Años Laborados vs Días de Vacaciones) */}
            <div className="my-4 max-h-72 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3.5">Años Laborados</th>
                    <th className="py-2.5 px-3.5 text-right">Días de Vacaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">1 Año</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">12 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">2 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">14 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">3 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">16 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">4 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">18 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">5 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">20 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">6 a 10 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">22 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">11 a 15 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">24 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">16 a 20 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">26 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">21 a 25 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">28 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">26 a 30 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">30 Días</td>
                  </tr>
                  <tr className="hover:bg-gray-50/70">
                    <td className="py-2 px-3.5">31 a 35 Años</td>
                    <td className="py-2 px-3.5 text-right font-bold text-blue-700">32 Días</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Texto explicativo al pie del modal */}
            <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200 leading-relaxed">
              Los días de vacaciones se actualizan automáticamente en la fecha de tu aniversario laboral según tus años de antigüedad acumulados.
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setModalTabuladorVacaciones(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Política de Beneficio Días Flex
          ======================================================== */}
      {modalPoliticaFlex && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setModalPoliticaFlex(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    Política de Beneficio Días Flex
                  </h4>
                  <p className="text-xs text-gray-500">Beneficio Corporativo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPoliticaFlex(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-pointer transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido explicativo */}
            <div className="my-4 space-y-3">
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-gray-700 leading-relaxed">
                Los Días Flex son un beneficio de hasta <strong>3 días al año</strong>. Se renuevan el 1 de enero de cada año y vencen el 31 de diciembre.
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>
                  <strong>Importante:</strong> Este beneficio no es acumulable de un año para otro.
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setModalPoliticaFlex(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
