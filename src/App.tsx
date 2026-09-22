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
  Briefcase
} from 'lucide-react';

interface Solicitud {
  id: string;
  tipo: 'Vacaciones' | 'Día Flex';
  fechas: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estatus: 'Pendiente de Aprobación (Jefe)' | 'Aprobado' | 'Cancelada (Reversada)';
  esExcepcion?: boolean;
  motivo?: string;
  fechaRegistro: string;
}

export default function App() {
  // Manejo de Vistas (VISTA 1: Login, VISTA 2: Dashboard)
  const [vistaActual, setVistaActual] = useState<'login' | 'dashboard'>('login');

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
  const [diasOficiales, setDiasOficiales] = useState(10);
  const [diasFlexAsignados, setDiasFlexAsignados] = useState(2);

  // Historial de solicitudes (con los datos requeridos por la especificación)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
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
  ]);

  // Cálculos dinámicos de saldo
  // Días de vacaciones en estatus "Pendiente"
  const diasPendientesVacaciones = solicitudes
    .filter((s) => s.tipo === 'Vacaciones' && s.estatus === 'Pendiente de Aprobación (Jefe)')
    .reduce((acc, curr) => acc + curr.dias, 0);

  // Días de vacaciones ya aprobados y disfrutados o comprometidos en el período
  const diasAprobadosVacaciones = solicitudes
    .filter((s) => s.tipo === 'Vacaciones' && s.estatus === 'Aprobado')
    .reduce((acc, curr) => acc + curr.dias, 0);

  // Saldo visual disponible = Días Oficiales - Pendientes (como requiere la especificación: "8 días. (10 Días Oficiales - 2 Pendientes)")
  // Permitimos que empiece en 8 como pide el brief (o calculado)
  const saldoVacacionesCalculado = Math.max(0, diasOficiales - diasPendientesVacaciones);

  // Días Flex disponibles
  const diasFlexUsados = solicitudes
    .filter((s) => s.tipo === 'Día Flex' && (s.estatus === 'Aprobado' || s.estatus === 'Pendiente de Aprobación (Jefe)'))
    .reduce((acc, curr) => acc + curr.dias, 0);
  const saldoFlexCalculado = Math.max(0, diasFlexAsignados - diasFlexUsados);

  // Estado del formulario de Nueva Solicitud
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'Vacaciones' | 'Día Flex'>('Vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [solicitarSaldoCero, setSolicitarSaldoCero] = useState(false);
  const [motivoSolicitud, setMotivoSolicitud] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState<{ tipo: 'exito' | 'error' | 'info'; texto: string } | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [modalEdicion, setModalEdicion] = useState<Solicitud | null>(null);
  const [modalConfirmarReversar, setModalConfirmarReversar] = useState<Solicitud | null>(null);
  const [filtroEstatus, setFiltroEstatus] = useState<'todos' | 'Pendiente' | 'Aprobado'>('todos');

  // Lógica condicional: Si el interruptor está activo O si el saldo es 0
  const saldoActualTipo = tipoSeleccionado === 'Vacaciones' ? saldoVacacionesCalculado : saldoFlexCalculado;
  const requiereMotivo = solicitarSaldoCero || saldoActualTipo === 0;

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

    if (!fechaInicio) {
      setMensajeFeedback({ tipo: 'error', texto: 'Por favor selecciona la fecha de inicio.' });
      return;
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

    // Validación de Saldo en 0
    if (requiereMotivo && (!motivoSolicitud || motivoSolicitud.trim().length < 5)) {
      setMensajeFeedback({
        tipo: 'error',
        texto: 'El campo "Motivo de la solicitud" es obligatorio para solicitudes con saldo en 0 o por excepción (mínimo 5 caracteres).',
      });
      return;
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
      esExcepcion: requiereMotivo,
      motivo: motivoSolicitud.trim() || undefined,
      fechaRegistro: 'Hoy',
    };

    setSolicitudes([nuevaSol, ...solicitudes]);
    setMensajeFeedback({
      tipo: 'exito',
      texto: `Solicitud ${nuevaSol.id} registrada con éxito. Notificación enviada a ${colaborador.jefeDirecto} para su revisión.`,
    });

    // Reset de formulario
    setFechaInicio('');
    setFechaFin('');
    setMotivoSolicitud('');
    setSolicitarSaldoCero(false);

    setTimeout(() => {
      setMensajeFeedback(null);
    }, 6000);
  };

  // Reversar / Cancelar solicitud aprobada
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
          {/* Logo simulado corporativo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-blue-600 text-white font-bold text-xl mb-3 shadow-none">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Portal de Colaboradores
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sistema de Gestión de Vacaciones, Permisos y Asistencia
            </p>
          </div>

          {/* Tarjeta de Login */}
          <div className="bg-white py-8 px-6 border border-gray-200 rounded-lg sm:px-10">
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
                <span>Autenticación centralizada · Conexión segura SSL</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400">
              Intelexion HR Connector v24.9 · Ayvi Soluciones Corporativas
            </span>
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
    if (filtroEstatus === 'Pendiente') return s.estatus.includes('Pendiente');
    if (filtroEstatus === 'Aprobado') return s.estatus === 'Aprobado';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Barra de Navegación Superior Corporativa (Top Bar Contract: 3 zonas) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zona 1: Brand / Título corporativo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-semibold text-gray-900 tracking-tight block">
                  Portal de Colaboradores
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  Módulo de Vacaciones y Asistencia
                </span>
              </div>
            </div>

            {/* Zona 2: Enlaces de navegación limpios */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <span className="text-blue-600 border-b-2 border-blue-600 py-5 font-semibold">
                Mis Solicitudes y Saldos
              </span>
              <button
                type="button"
                onClick={() => {
                  alert(
                    'Política RH-04:\n• Solicitudes con anticipación mínima de 7 días naturales.\n• Los Días Flex no pueden tomarse de forma consecutiva ni adjuntos a puentes oficiales sin autorización previa.\n• Sincronización oficial de saldos generada vía Intelexion.'
                  );
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors py-5 cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Políticas de Asistencia
              </button>
              <button
                type="button"
                onClick={handleSincronizarIntelexion}
                className="text-gray-600 hover:text-gray-900 transition-colors py-5 cursor-pointer flex items-center gap-1.5"
                title="Forzar actualización con base de datos Intelexion"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>Sincronizar Intelexion</span>
              </button>
            </nav>

            {/* Zona 3: Información de usuario y Salir */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 text-right pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-xs border border-gray-300">
                  FC
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    {colaborador.nombre}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {colaborador.numEmpleado}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded transition-colors cursor-pointer"
                title="Cerrar sesión actual"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
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

            {/* Sincronización Intelexion */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Fuente de datos: <strong>Intelexion Nómina & RH</strong> (Última actualización: Hoy, 08:30 hrs)</span>
              </div>
              <button
                onClick={handleSincronizarIntelexion}
                disabled={sincronizando}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>Actualizar saldos</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Saldo (2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tarjeta 1: Saldo de Vacaciones */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Saldo de Vacaciones
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    Ley Federal de Trabajo
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  {/* Número grande requerido (ej. 8 días) */}
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {saldoVacacionesCalculado}
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    días disponibles
                  </span>
                </div>

                {/* Matemática visual requerida: "(10 Días Oficiales - 2 Pendientes)" */}
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2.5 font-mono">
                  ({diasOficiales} Días Oficiales - {diasPendientesVacaciones} Pendientes)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Período correspondiente: 2025 - 2026</span>
                <span>Vigencia para disfrutar: 14/Sep/2026</span>
              </div>
            </div>

            {/* Tarjeta 2: Días Flex */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Días Flex
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    Beneficio Corporativo
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  {/* Número grande requerido (ej. 2 días) */}
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">
                    {saldoFlexCalculado}
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    días disponibles
                  </span>
                </div>

                {/* Texto explicativo */}
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2.5 font-mono">
                  ({diasFlexAsignados} Días asignados cuatrimestrales - {diasFlexUsados} Utilizados/En trámite)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Renovación cuatrimestral: 01/Ene/2027</span>
                <span>No acumulables entre períodos</span>
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
                        if (tipoSeleccionado === 'Día Flex') {
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
                      Fecha de fin
                    </label>
                    <input
                      id="fecha-fin"
                      type="date"
                      required={tipoSeleccionado === 'Vacaciones'}
                      disabled={tipoSeleccionado === 'Día Flex'}
                      value={tipoSeleccionado === 'Día Flex' ? fechaInicio : fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      min={fechaInicio || undefined}
                      className="w-full text-xs rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-400"
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

                {/* Regla de Negocio Crítica (Lógica condicional de UI):
                    Interruptor (toggle) o checkbox simulado que diga "Solicitar con saldo en 0 (Excepción)" */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="toggle-saldo-cero"
                      className="text-xs font-medium text-gray-900 cursor-pointer flex flex-col"
                    >
                      <span>Solicitar con saldo en 0 (Excepción)</span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        Permite tramitar permisos sin saldo a cuenta de próximo período
                      </span>
                    </label>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      id="toggle-saldo-cero"
                      role="switch"
                      aria-checked={solicitarSaldoCero}
                      onClick={() => setSolicitarSaldoCero(!solicitarSaldoCero)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        solicitarSaldoCero ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          solicitarSaldoCero ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Si está activo o si el saldo simulado es 0, debe aparecer dinámicamente:
                    "Motivo de la solicitud (Obligatorio para saldos en 0)" */}
                {requiereMotivo && (
                  <div className="pt-2 animate-fadeIn">
                    <label
                      htmlFor="motivo-solicitud"
                      className="block text-xs font-semibold text-red-700 mb-1"
                    >
                      Motivo de la solicitud (Obligatorio para saldos en 0) *
                    </label>
                    <textarea
                      id="motivo-solicitud"
                      rows={3}
                      required
                      value={motivoSolicitud}
                      onChange={(e) => setMotivoSolicitud(e.target.value)}
                      placeholder="Indica la justificación de la excepción para revisión de RH y tu Jefatura..."
                      className="w-full text-xs rounded border border-red-300 p-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Esta solicitud requiere un visto bueno adicional de la Dirección de Recursos Humanos.
                    </p>
                  </div>
                )}

                {/* Botón de envío requerido: "Enviar Solicitud al Jefe Directo" */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 border border-transparent rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                  >
                    Enviar Solicitud al Jefe Directo
                  </button>
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
                    onClick={() => setFiltroEstatus('Pendiente')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      filtroEstatus === 'Pendiente'
                        ? 'bg-white text-gray-900 font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pendientes
                  </button>
                  <button
                    onClick={() => setFiltroEstatus('Aprobado')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      filtroEstatus === 'Aprobado'
                        ? 'bg-white text-gray-900 font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Aprobados
                  </button>
                </div>
              </div>

              {/* Tabla simple requerida */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Fechas</th>
                      <th className="py-3 px-4">Días Solicitados</th>
                      <th className="py-3 px-4">Estatus</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {solicitudesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No hay solicitudes para el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      solicitudesFiltradas.map((sol) => (
                        <tr key={sol.id} className="hover:bg-gray-50/75 transition-colors">
                          {/* Columna Tipo */}
                          <td className="py-3.5 px-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{sol.tipo}</span>
                              {sol.esExcepcion && (
                                <span
                                  className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-mono"
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
                          <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap font-mono">
                            {sol.fechas}
                          </td>

                          {/* Columna Días solicitados */}
                          <td className="py-3.5 px-4 text-gray-900 whitespace-nowrap font-medium tabular-nums">
                            {sol.dias} {sol.dias === 1 ? 'día' : 'días'}
                          </td>

                          {/* Columna Estatus (Badges requeridos) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {sol.estatus === 'Pendiente de Aprobación (Jefe)' && (
                              /* Badge amarillo requerido */
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                                Pendiente de Aprobación (Jefe)
                              </span>
                            )}

                            {sol.estatus === 'Aprobado' && (
                              /* Badge verde requerido */
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                Aprobado
                              </span>
                            )}

                            {sol.estatus === 'Cancelada (Reversada)' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                                Cancelada (Reversada)
                              </span>
                            )}
                          </td>

                          {/* Columna Acciones */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {sol.estatus === 'Pendiente de Aprobación (Jefe)' && (
                              <button
                                onClick={() => setModalEdicion(sol)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                              >
                                Editar
                              </button>
                            )}

                            {sol.estatus === 'Aprobado' && (
                              /* Botón o link sutil rojo que diga "Cancelar Solicitud (Reversar)" */
                              <button
                                onClick={() => setModalConfirmarReversar(sol)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline cursor-pointer"
                              >
                                Cancelar Solicitud (Reversar)
                              </button>
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
                  Firmado digitalmente bajo política corporativa Ayvi
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================
          MODAL: Cancelar Solicitud (Reversar)
          ======================================================== */}
      {modalConfirmarReversar && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 shadow-none">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  ¿Confirmas reversar esta solicitud?
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Estás a punto de cancelar la solicitud aprobada de{' '}
                  <strong className="text-gray-900">{modalConfirmarReversar.tipo}</strong> ({modalConfirmarReversar.fechas}).
                </p>
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-2.5 text-xs text-gray-700">
                  <strong>Efecto en tu saldo:</strong> Se reintegrarán automáticamente{' '}
                  <span className="font-semibold text-gray-900">{modalConfirmarReversar.dias} día(s)</span> a tu saldo oficial en Intelexion.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalConfirmarReversar(null)}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
              >
                No, mantenerla
              </button>
              <button
                type="button"
                onClick={() => ejecutarReverso(modalConfirmarReversar)}
                className="px-3.5 py-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
              >
                Sí, Cancelar y Reversar
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
    </div>
  );
}
