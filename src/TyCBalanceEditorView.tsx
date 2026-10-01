import React, { useState, useMemo } from 'react';
import {
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  History,
  X,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import MinimalAlertModal, { AlertModalState } from './MinimalAlertModal';

export interface EmployeeBalanceRecord {
  nomina: string;
  nombre: string;
  departamento: string;
  puesto?: string;
  jefeDirecto?: string;
  saldos: {
    vacaciones: number;
    flex: number;
    homeWeek: number;
  };
}

export interface BalanceAuditEntry {
  id: string;
  fecha: string;
  nomina: string;
  colaborador: string;
  departamento: string;
  beneficio: 'Vacaciones' | 'Día Flex' | 'Home week';
  tipoMovimiento: 'Abono (Sumar días)' | 'Cargo (Restar días)';
  cantidad: number;
  saldoAnterior: number;
  saldoNuevo: number;
  justificacion: string;
  responsable: string;
}

export const MOCK_EMPLOYEES: EmployeeBalanceRecord[] = [
  {
    nomina: 'EMP-04829',
    nombre: 'Fernando Carrillo',
    departamento: 'Compensaciones',
    puesto: 'Analista de Compensaciones',
    jefeDirecto: 'Emmanuel Muñoz',
    saldos: {
      vacaciones: 5,
      flex: 3,
      homeWeek: 1,
    },
  },
  {
    nomina: 'EMP-05309',
    nombre: 'Alejandro Morales Cruz',
    departamento: 'Ingeniería y TI',
    puesto: 'Ingeniero de Software Senior',
    jefeDirecto: 'Emmanuel Muñoz',
    saldos: {
      vacaciones: 10,
      flex: 2,
      homeWeek: 1,
    },
  },
  {
    nomina: 'EMP-02194',
    nombre: 'Mariana Ríos Domínguez',
    departamento: 'Operaciones y Logística',
    puesto: 'Coordinadora de Distribución',
    jefeDirecto: 'Sofía Rivera',
    saldos: {
      vacaciones: 0,
      flex: 0,
      homeWeek: 0,
    },
  },
  {
    nomina: 'EMP-03881',
    nombre: 'Carlos Mendoza Silva',
    departamento: 'Finanzas Corporativas',
    puesto: 'Especialista Contable',
    jefeDirecto: 'Javier Gómez',
    saldos: {
      vacaciones: 14,
      flex: 1,
      homeWeek: 1,
    },
  },
  {
    nomina: 'EMP-01452',
    nombre: 'Beatriz Salazar Orozco',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista Senior TyC',
    jefeDirecto: 'Patricia Treviño',
    saldos: {
      vacaciones: 8,
      flex: 4,
      homeWeek: 1,
    },
  },
  {
    nomina: 'EMP-06720',
    nombre: 'Rodrigo Nava Esquivel',
    departamento: 'Comercial y Ventas',
    puesto: 'Ejecutivo de Cuentas Clave',
    jefeDirecto: 'Gerardo Alarcón',
    saldos: {
      vacaciones: 2,
      flex: 1,
      homeWeek: 0,
    },
  },
];

export const TyCBalanceEditorView: React.FC = () => {
  // Estado de Navegación por Sub-Pestañas: 'ajustes' (Búsqueda y Ajustes) vs 'bitacora' (Bitácora de Auditoría)
  const [activeTab, setActiveTab] = useState<'ajustes' | 'bitacora'>('ajustes');

  // Estado de colaboradores con saldos actualizables
  const [employees, setEmployees] = useState<EmployeeBalanceRecord[]>(MOCK_EMPLOYEES);

  // Filtros de búsqueda (Search-First)
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Master-Detail de Ajuste de Saldo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeBalanceRecord | null>(null);

  // Formulario del Modal de Ajuste
  const [beneficioAfectar, setBeneficioAfectar] = useState<'vacaciones' | 'flex' | 'homeWeek'>('vacaciones');
  const [tipoMovimiento, setTipoMovimiento] = useState<'abono' | 'cargo'>('abono');
  const [cantidadDias, setCantidadDias] = useState<number>(1);
  const [justificacion, setJustification] = useState('');

  // Toast flotante de notificación
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de notificación unificado
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Bitácora de auditoría histórica
  const [auditLog, setAuditLog] = useState<BalanceAuditEntry[]>([
    {
      id: 'ADJ-2026-003',
      fecha: '25/Sep/2026 11:40 AM',
      nomina: 'EMP-04829',
      colaborador: 'Fernando Carrillo',
      departamento: 'Compensaciones',
      beneficio: 'Vacaciones',
      tipoMovimiento: 'Abono (Sumar días)',
      cantidad: 2,
      saldoAnterior: 3,
      saldoNuevo: 5,
      justificacion: 'Bono por desempeño extraordinario en cierre de auditoría laboral Q3.',
      responsable: 'Generalista TyC',
    },
    {
      id: 'ADJ-2026-002',
      fecha: '18/Sep/2026 04:15 PM',
      nomina: 'EMP-03881',
      colaborador: 'Carlos Mendoza Silva',
      departamento: 'Finanzas Corporativas',
      beneficio: 'Día Flex',
      tipoMovimiento: 'Cargo (Restar días)',
      cantidad: 1,
      saldoAnterior: 2,
      saldoNuevo: 1,
      justificacion: 'Ajuste por disfrute manual de día flex no reportado en portal.',
      responsable: 'Jefatura de TyC',
    },
  ]);

  // Modo Search-First: si no hay término de búsqueda, no se renderizan colaboradores
  const hasActiveSearch = searchTerm.trim().length > 0;

  // Filtrado de empleados en tiempo real para la pestaña de Ajustes
  const filteredEmployees = useMemo(() => {
    if (!hasActiveSearch) return [];

    const query = searchTerm.toLowerCase().trim();
    return employees.filter((emp) => {
      return (
        emp.nombre.toLowerCase().includes(query) ||
        emp.nomina.toLowerCase().includes(query)
      );
    });
  }, [employees, searchTerm, hasActiveSearch]);

  // Manejo de apertura del modal enfocado en un colaborador
  const handleOpenAjusteModal = (emp: EmployeeBalanceRecord) => {
    setSelectedEmp(emp);
    setBeneficioAfectar('vacaciones');
    setTipoMovimiento('abono');
    setCantidadDias(1);
    setJustification('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmp(null);
  };

  // Cálculo en vivo del saldo resultante proyectado
  const saldoActual = selectedEmp ? selectedEmp.saldos[beneficioAfectar] : 0;
  const cantValida = Number(cantidadDias) > 0 ? Number(cantidadDias) : 0;
  const delta = tipoMovimiento === 'abono' ? cantValida : -cantValida;
  const saldoProyectado = saldoActual + delta;

  // Validación de activación del botón "Aplicar Ajuste"
  const isSubmitDisabled =
    !selectedEmp ||
    cantValida <= 0 ||
    justificacion.trim().length < 5;

  // Procesamiento del ajuste manual con auditoría
  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || isSubmitDisabled) return;

    const nombreBeneficio: Record<'vacaciones' | 'flex' | 'homeWeek', 'Vacaciones' | 'Día Flex' | 'Home week'> = {
      vacaciones: 'Vacaciones',
      flex: 'Día Flex',
      homeWeek: 'Home week',
    };

    const labelBeneficio = nombreBeneficio[beneficioAfectar];
    const tipoLabel = tipoMovimiento === 'abono' ? 'Abono (Sumar días)' : 'Cargo (Restar días)';

    // 1. Actualizar el saldo del colaborador en el estado
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.nomina === selectedEmp.nomina) {
          return {
            ...emp,
            saldos: {
              ...emp.saldos,
              [beneficioAfectar]: saldoProyectado,
            },
          };
        }
        return emp;
      })
    );

    // 2. Registrar el movimiento en la bitácora de auditoría
    const folioAudit = `ADJ-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const fechaActual = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const nuevaBitacora: BalanceAuditEntry = {
      id: folioAudit,
      fecha: fechaActual,
      nomina: selectedEmp.nomina,
      colaborador: selectedEmp.nombre,
      departamento: selectedEmp.departamento,
      beneficio: labelBeneficio,
      tipoMovimiento: tipoLabel,
      cantidad: cantValida,
      saldoAnterior: saldoActual,
      saldoNuevo: saldoProyectado,
      justificacion: justificacion.trim(),
      responsable: 'Generalista TyC (Admin)',
    };

    setAuditLog((prev) => [nuevaBitacora, ...prev]);

    // 3. Cerrar el modal
    setIsModalOpen(false);

    // 4. Mostrar alerta visual y toast de éxito requerido
    const mensajeExito = 'Saldo actualizado. El movimiento ha quedado registrado en la bitácora de auditoría.';
    setToastMessage(mensajeExito);
    setAlertModal({
      isOpen: true,
      title: 'Ajuste de Saldo Aplicado',
      message: `${mensajeExito} Se registró el folio de auditoría ${folioAudit} para ${selectedEmp.nombre}.`,
      type: 'success',
    });

    // Auto-dismiss del toast tras 5 segundos
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notificación Flotante */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-emerald-900/90 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/30 flex items-start gap-3 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-emerald-100">Operación Exitosa</p>
            <p className="mt-0.5 text-emerald-200">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white p-0.5"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          CABECERA DE LA VISTA
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900">
          Gestión de Saldos y Ajustes Manuales
        </h2>
        <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
          Panel administrativo exclusivo de Centro de Servicios.
        </p>

        {/* ========================================================
            BARRA DE SUB-PESTAÑAS (TABS)
            ======================================================== */}
        <div className="border-b border-gray-200 mt-5">
          <nav className="flex space-x-6" aria-label="Sub-pestañas de Gestión de Saldos">
            {/* Pestaña 1: Búsqueda y Ajustes */}
            <button
              type="button"
              onClick={() => setActiveTab('ajustes')}
              className={`py-3 px-1 border-b-2 text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'ajustes'
                  ? 'border-purple-600 text-purple-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Búsqueda y Ajustes</span>
            </button>

            {/* Pestaña 2: Bitácora de Auditoría */}
            <button
              type="button"
              onClick={() => setActiveTab('bitacora')}
              className={`py-3 px-1 border-b-2 text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'bitacora'
                  ? 'border-purple-600 text-purple-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Bitácora de Auditoría</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'bitacora'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {auditLog.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* ========================================================
          CONTENIDO CONDICIONAL SEGÚN LA PESTAÑA ACTIVA
          ======================================================== */}

      {/* --------------------------------------------------------
          PESTAÑA 1: BÚSQUEDA Y AJUSTES (SEARCH-FIRST)
          -------------------------------------------------------- */}
      {activeTab === 'ajustes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Barra de Búsqueda Prominente */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-employee-input"
                type="text"
                autoFocus
                placeholder="Buscar por Nombre o Número de Nómina (ej. Fernando, EMP-04829)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 hover:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Renderizado de Resultados: Empty State vs Tabla */}
          {!hasActiveSearch ? (
            /* Estado Inicial Vacío */
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-xs animate-fadeIn">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 text-gray-300 mx-auto flex items-center justify-center mb-4">
                <Search className="text-gray-300 w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Ingresa el nombre o número de nómina para buscar a un colaborador.
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto">
                Usa la barra superior para localizar colaboradores activos en la nómina y ajustar sus saldos de Vacaciones, Días Flex o Home week.
              </p>

              {/* Atajos de búsqueda rápida sugeridos */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-5 border-t border-gray-100 max-w-lg mx-auto">
                <span className="text-[11px] text-gray-400 font-medium">Búsquedas rápidas:</span>
                {['Fernando Carrillo', 'EMP-04829', 'Mariana Ríos', 'EMP-05309'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setSearchTerm(sug)}
                    className="text-[11px] font-mono bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            /* Sin coincidencias */
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-xs animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">
                No se encontraron colaboradores para "{searchTerm}"
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Verifica que la nómina o el nombre estén escritos correctamente.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar búsqueda</span>
              </button>
            </div>
          ) : (
            /* Despliegue Dinámico de Resultados (Tabla de Saldos) */
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs animate-fadeIn">
              <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Resultados de la Búsqueda ({filteredEmployees.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Coincidencias encontradas para "{searchTerm}" en la base de colaboradores.
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  Intelexion HR · Sync 2026
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px] table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Colaborador</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Nómina</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Departamento</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Vacaciones</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Días Flex</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Home Week</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredEmployees.map((emp) => {
                      const tieneCeroVacaciones = emp.saldos.vacaciones <= 0;
                      const tieneCeroFlex = emp.saldos.flex <= 0;
                      const tieneCeroHW = emp.saldos.homeWeek <= 0;

                      return (
                        <tr
                          key={emp.nomina}
                          className="hover:bg-purple-50/40 transition-colors"
                        >
                          {/* COLABORADOR */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="font-medium text-gray-800">
                              {emp.nombre}
                            </div>
                            {emp.puesto && (
                              <div className="text-[11px] text-gray-500 font-normal">
                                {emp.puesto}
                              </div>
                            )}
                          </td>

                          {/* NÓMINA */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-gray-500">
                            {emp.nomina}
                          </td>

                          {/* DEPARTAMENTO */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-gray-600">
                            {emp.departamento}
                          </td>

                          {/* VACACIONES */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                            {tieneCeroVacaciones ? (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <span>0 días</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {emp.saldos.vacaciones} {emp.saldos.vacaciones === 1 ? 'día' : 'días'}
                              </span>
                            )}
                          </td>

                          {/* DÍAS FLEX */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                            {tieneCeroFlex ? (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <span>0 días</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {emp.saldos.flex} {emp.saldos.flex === 1 ? 'día' : 'días'}
                              </span>
                            )}
                          </td>

                          {/* HOME WEEK */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                            {tieneCeroHW ? (
                              <span className="inline-flex items-center gap-1 text-gray-400 font-normal text-xs">
                                <span>0 sem</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                {emp.saldos.homeWeek} {emp.saldos.homeWeek === 1 ? 'semana' : 'semanas'}
                              </span>
                            )}
                          </td>

                          {/* ACCIONES: Botón principal "Ajustar Saldo" */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenAjusteModal(emp)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 shadow-xs transition-colors cursor-pointer"
                              title={`Ajustar saldo manual de ${emp.nombre}`}
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Ajustar Saldo</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------
          PESTAÑA 2: BITÁCORA DE AUDITORÍA (DIRECTO EN PANTALLA COMPLETA)
          -------------------------------------------------------- */}
      {activeTab === 'bitacora' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs animate-fadeIn">
          <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700" />
                <span>Bitácora de Auditoría de Ajustes Manuales</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Historial inmutable de movimientos extraordinarios de saldos efectuados por Talento y Cultura.
              </p>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Registros no borrables · Auditoría TyC
            </span>
          </div>

          {auditLog.length === 0 ? (
            <div className="p-16 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-gray-900">
                No hay movimientos registrados
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Los ajustes manuales aplicados a los saldos de los colaboradores quedarán asentados en esta bitácora.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px] table-auto">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Folio</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Fecha / Hora</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Colaborador</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Beneficio</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Tipo</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Ajuste</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Previo → Nuevo</th>
                    <th className="py-2.5 px-3.5">Motivo / Justificación</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {auditLog.map((log) => {
                    const esAbono = log.tipoMovimiento.startsWith('Abono');
                    return (
                      <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                        {/* FOLIO */}
                        <td className="py-3 px-3.5 font-mono text-purple-700 font-semibold whitespace-nowrap">
                          {log.id}
                        </td>

                        {/* FECHA / HORA */}
                        <td className="py-3 px-3.5 text-gray-500 whitespace-nowrap text-xs">
                          {log.fecha}
                        </td>

                        {/* COLABORADOR */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-medium text-gray-900 block">{log.colaborador}</span>
                          <span className="text-[11px] text-gray-400 font-mono">{log.nomina}</span>
                        </td>

                        {/* BENEFICIO */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-medium text-gray-700">
                          {log.beneficio}
                        </td>

                        {/* TIPO (Abono/Cargo) */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              esAbono
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {esAbono ? '+ Abono' : '- Cargo'}
                          </span>
                        </td>

                        {/* AJUSTE */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-center font-bold">
                          <span className={esAbono ? 'text-emerald-700' : 'text-amber-700'}>
                            {esAbono ? `+${log.cantidad}` : `-${log.cantidad}`}
                          </span>
                        </td>

                        {/* PREVIO → NUEVO */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-center font-mono text-gray-600">
                          {log.saldoAnterior} → <span className="font-bold text-gray-900">{log.saldoNuevo}</span>
                        </td>

                        {/* MOTIVO / JUSTIFICACIÓN */}
                        <td className="py-3 px-3.5 text-gray-700 max-w-sm text-xs leading-relaxed" title={log.justificacion}>
                          {log.justificacion}
                        </td>

                        {/* RESPONSABLE */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-gray-500 text-xs">
                          {log.responsable}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer de la bitácora */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-mono">
            <span>Mostrando {auditLog.length} movimiento(s) de conciliación</span>
            <span>Auditoría TyC · Sistema Integral 2026</span>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE AJUSTE DE SALDO (MASTER-DETAIL)
          ======================================================== */}
      {isModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Ajustar Saldo Manual
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {selectedEmp.nomina} · {selectedEmp.nombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha Resumen del Colaborador (Master) */}
            <div className="bg-purple-50/50 px-6 py-3 border-b border-purple-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500">Departamento:</span>{' '}
                <span className="font-semibold text-gray-800">{selectedEmp.departamento}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Saldos actuales:</span>
                <span className="font-mono text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                  Vac: {selectedEmp.saldos.vacaciones}d
                </span>
                <span className="font-mono text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                  Flex: {selectedEmp.saldos.flex}d
                </span>
                <span className="font-mono text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                  HW: {selectedEmp.saldos.homeWeek}s
                </span>
              </div>
            </div>

            {/* Formulario de Ajuste (Detail) */}
            <form onSubmit={handleApplyAdjustment} className="p-6 space-y-4">
              {/* 1. Selector de Beneficio a afectar */}
              <div>
                <label
                  htmlFor="beneficio-select"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Beneficio a afectar <span className="text-red-500">*</span>
                </label>
                <select
                  id="beneficio-select"
                  value={beneficioAfectar}
                  onChange={(e) =>
                    setBeneficioAfectar(e.target.value as 'vacaciones' | 'flex' | 'homeWeek')
                  }
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                >
                  <option value="vacaciones">Vacaciones (Saldo actual: {selectedEmp.saldos.vacaciones} días)</option>
                  <option value="flex">Día Flex (Saldo actual: {selectedEmp.saldos.flex} días)</option>
                  <option value="homeWeek">Home week (Saldo actual: {selectedEmp.saldos.homeWeek} semana)</option>
                </select>
              </div>

              {/* 2. Tipo de Movimiento: Abono vs Cargo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tipo de Movimiento <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      tipoMovimiento === 'abono'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoMovimiento"
                      value="abono"
                      checked={tipoMovimiento === 'abono'}
                      onChange={() => setTipoMovimiento('abono')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">Abono (Sumar días)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      tipoMovimiento === 'cargo'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoMovimiento"
                      value="cargo"
                      checked={tipoMovimiento === 'cargo'}
                      onChange={() => setTipoMovimiento('cargo')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <Minus className="w-4 h-4 text-amber-600" />
                    <span className="text-xs">Cargo (Restar días)</span>
                  </label>
                </div>
              </div>

              {/* 3. Cantidad de Días */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="cantidad-dias"
                    className="block text-xs font-semibold text-gray-700"
                  >
                    Cantidad de {beneficioAfectar === 'homeWeek' ? 'Semanas' : 'Días'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">Mínimo 1</span>
                </div>
                <input
                  id="cantidad-dias"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={cantidadDias}
                  onChange={(e) => setCantidadDias(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ingresa la cantidad de días..."
                />
              </div>

              {/* Tarjeta de Proyección del Movimiento en Vivo */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px] font-sans">Saldo Actual</span>
                  <span className="font-bold text-gray-800">{saldoActual}</span>
                </div>
                <div className="text-center font-bold">
                  <span className="text-gray-500 block text-[10px] font-sans">Ajuste</span>
                  <span className={tipoMovimiento === 'abono' ? 'text-emerald-600' : 'text-amber-600'}>
                    {tipoMovimiento === 'abono' ? `+${cantValida}` : `-${cantValida}`}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px] font-sans">Nuevo Saldo</span>
                  <span
                    className={`font-bold text-sm ${
                      saldoProyectado < 0 ? 'text-red-600 underline' : 'text-purple-700'
                    }`}
                  >
                    {saldoProyectado} {beneficioAfectar === 'homeWeek' ? 'sem' : 'días'}
                  </span>
                </div>
              </div>

              {/* 4. Justificación Obligatoria */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="justificacion-ajuste"
                    className="block text-xs font-semibold text-gray-700"
                  >
                    Justificación del Ajuste <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      justificacion.trim().length >= 5
                        ? 'text-emerald-600 font-semibold'
                        : 'text-gray-400'
                    }`}
                  >
                    {justificacion.trim().length}/5 caracteres mín.
                  </span>
                </div>
                <textarea
                  id="justificacion-ajuste"
                  rows={3}
                  required
                  value={justificacion}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explica detalladamente la razón institucional (ej. Bono por proyecto extraordinario, Corrección de saldo de aniversario, Anticipo manual autorizado)..."
                  className="w-full text-xs rounded-lg border border-gray-300 p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {justificacion.trim().length > 0 && justificacion.trim().length < 5 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    La justificación debe tener al menos 5 caracteres explicativos.
                  </p>
                )}
              </div>

              {/* Botones de Acción del Modal */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Aplicar Ajuste</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Unificado Minimalista de Notificación */}
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

export default TyCBalanceEditorView;
