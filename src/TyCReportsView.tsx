import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCheck2,
  ArrowUpDown,
  CalendarRange,
  AlertCircle,
  MessageSquare,
  X,
  Eye
} from 'lucide-react';
import RequestDetailsModal from './RequestDetailsModal';

export interface TyCRequestRecord {
  id: string;
  folio: string;
  nomina: string;
  colaborador: string;
  departamento: string;
  tipo: 'Vacaciones' | 'Día Flex' | 'Home week';
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  dias: number;
  estatus: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada' | 'Expirado por Sistema';
  esExcepcion: boolean;
  motivoExcepcion?: string;
  jefeDirecto?: string;
  saldoDisponible?: number;
  fechaSolicitud?: string;
  comentarios?: string;
}

export const MOCK_ALL_REQUESTS: TyCRequestRecord[] = [
  {
    id: 'FOL-2026-008',
    folio: 'FOL-2026-008',
    nomina: 'EMP-05309',
    colaborador: 'Alejandro Morales Cruz',
    departamento: 'Ingeniería y TI',
    tipo: 'Vacaciones',
    fechaInicio: '2026-10-09',
    fechaFin: '2026-10-15',
    dias: 5,
    saldoDisponible: 10,
    fechaSolicitud: '20/Sep/2026',
    comentarios: '',
    estatus: 'Pendiente',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-007',
    folio: 'FOL-2026-007',
    nomina: 'EMP-04981',
    colaborador: 'Mariana Rivas Pacheco',
    departamento: 'Calidad de Software',
    tipo: 'Vacaciones',
    fechaInicio: '2026-10-18',
    fechaFin: '2026-10-21',
    dias: 3,
    saldoDisponible: 0,
    fechaSolicitud: '22/Sep/2026',
    comentarios: 'Permiso sin saldo por fuerza mayor médica familiar.',
    estatus: 'Pendiente',
    esExcepcion: true,
    motivoExcepcion: 'Permiso sin saldo por fuerza mayor médica familiar (aniversario 2027 anticipado).',
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-005',
    folio: 'FOL-2026-005',
    nomina: 'EMP-05120',
    colaborador: 'Sofía Valenzuela Mendoza',
    departamento: 'Diseño e Innovación',
    tipo: 'Día Flex',
    fechaInicio: '2026-09-28',
    fechaFin: '2026-09-28',
    dias: 1,
    saldoDisponible: 2,
    fechaSolicitud: '18/Sep/2026',
    comentarios: '',
    estatus: 'Pendiente',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-006',
    folio: 'FOL-2026-006',
    nomina: 'EMP-05234',
    colaborador: 'Carlos Alberto Méndez',
    departamento: 'Arquitectura de Datos',
    tipo: 'Vacaciones',
    fechaInicio: '2026-11-03',
    fechaFin: '2026-11-07',
    dias: 4,
    saldoDisponible: 6,
    fechaSolicitud: '25/Sep/2026',
    comentarios: '',
    estatus: 'Pendiente',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-002',
    folio: 'FOL-2026-002',
    nomina: 'EMP-05120',
    colaborador: 'Sofía Valenzuela Mendoza',
    departamento: 'Diseño e Innovación',
    tipo: 'Vacaciones',
    fechaInicio: '2026-08-14',
    fechaFin: '2026-08-15',
    dias: 2,
    saldoDisponible: 8,
    fechaSolicitud: '01/Ago/2026',
    comentarios: '',
    estatus: 'Aprobada',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-012',
    folio: 'FOL-2026-012',
    nomina: 'EMP-04721',
    colaborador: 'Diego Gutiérrez Ponce',
    departamento: 'Operaciones y Logística',
    tipo: 'Vacaciones',
    fechaInicio: '2026-10-05',
    fechaFin: '2026-10-09',
    dias: 5,
    saldoDisponible: 5,
    fechaSolicitud: '29/Sep/2026',
    comentarios: 'Anticipación menor a 7 días autorizada mediante pase de excepción de jefatura.',
    estatus: 'Aprobada',
    esExcepcion: true,
    motivoExcepcion: 'Anticipación menor a 7 días autorizada mediante pase de excepción de jefatura.',
    jefeDirecto: 'Lic. Laura Benítez',
  },
  {
    id: 'FOL-2026-010',
    folio: 'FOL-2026-010',
    nomina: 'EMP-05519',
    colaborador: 'Elena Luna Fuentes',
    departamento: 'Compensaciones',
    tipo: 'Día Flex',
    fechaInicio: '2026-09-18',
    fechaFin: '2026-09-18',
    dias: 1,
    saldoDisponible: 1,
    fechaSolicitud: '10/Sep/2026',
    comentarios: '',
    estatus: 'Aprobada',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-001',
    folio: 'FOL-2026-001',
    nomina: 'EMP-05234',
    colaborador: 'Carlos Alberto Méndez',
    departamento: 'Arquitectura de Datos',
    tipo: 'Día Flex',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-01',
    dias: 1,
    saldoDisponible: 3,
    fechaSolicitud: '28/Jul/2026',
    comentarios: '',
    estatus: 'Rechazada',
    esExcepcion: false,
    jefeDirecto: 'Emmanuel Muñoz',
  },
  {
    id: 'FOL-2026-003',
    folio: 'FOL-2026-003',
    nomina: 'EMP-05411',
    colaborador: 'Raúl Domínguez Soto',
    departamento: 'Ingeniería y TI',
    tipo: 'Vacaciones',
    fechaInicio: '2026-09-10',
    fechaFin: '2026-09-15',
    dias: 4,
    saldoDisponible: 4,
    fechaSolicitud: '01/Sep/2026',
    comentarios: '',
    estatus: 'Expirado por Sistema',
    esExcepcion: false,
    jefeDirecto: 'Ing. Mateo Estrada',
  },
  {
    id: 'FOL-2026-014',
    folio: 'FOL-2026-014',
    nomina: 'EMP-04112',
    colaborador: 'Roberto Garza Salazar',
    departamento: 'Ciberseguridad',
    tipo: 'Vacaciones',
    fechaInicio: '2026-11-16',
    fechaFin: '2026-11-20',
    dias: 5,
    saldoDisponible: 12,
    fechaSolicitud: '05/Nov/2026',
    comentarios: 'Excepción de días no consecutivos autorizada por Dirección de TyC.',
    estatus: 'Aprobada',
    esExcepcion: true,
    motivoExcepcion: 'Excepción de días no consecutivos autorizada por Dirección de TyC.',
    jefeDirecto: 'Ing. Mateo Estrada',
  }
];

export const TyCReportsView: React.FC = () => {
  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepto, setSelectedDepto] = useState('Todos');
  const [selectedTipo, setSelectedTipo] = useState('Todos');
  const [selectedEstatus, setSelectedEstatus] = useState('Todos');
  const [selectedExcepcion, setSelectedExcepcion] = useState<'Todos' | 'Solo Excepciones' | 'Regulares'>('Todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [activeCommentAuthor, setActiveCommentAuthor] = useState<string>('');

  // Estado para el modal de vista detallada (Master-Detail para Auditoría)
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<TyCRequestRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenDetails = (item: TyCRequestRecord) => {
    setSelectedRequestForModal(item);
    setIsDetailsModalOpen(true);
  };

  // Lista de departamentos única
  const departamentos = useMemo(() => {
    const list = Array.from(new Set(MOCK_ALL_REQUESTS.map((r) => r.departamento)));
    return ['Todos', ...list];
  }, []);

  // Lógica de filtrado de datos
  const filteredData = useMemo(() => {
    return MOCK_ALL_REQUESTS.filter((item) => {
      // 1. Búsqueda por Nombre o Nómina
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.colaborador.toLowerCase().includes(term) ||
        item.nomina.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);

      // 2. Departamento
      const matchDepto = selectedDepto === 'Todos' || item.departamento === selectedDepto;

      // 3. Tipo
      const matchTipo = selectedTipo === 'Todos' || item.tipo === selectedTipo;

      // 4. Estatus
      const matchEstatus = selectedEstatus === 'Todos' || item.estatus === selectedEstatus;

      // 5. Excepción
      const matchExcepcion =
        selectedExcepcion === 'Todos' ||
        (selectedExcepcion === 'Solo Excepciones' && item.esExcepcion) ||
        (selectedExcepcion === 'Regulares' && !item.esExcepcion);

      // 6. Rango de Fechas (evalúa si fechaInicio o fechaFin caen dentro del rango)
      let matchFecha = true;
      if (fechaDesde && fechaHasta) {
        const inicioEnRango = item.fechaInicio >= fechaDesde && item.fechaInicio <= fechaHasta;
        const finEnRango = item.fechaFin >= fechaDesde && item.fechaFin <= fechaHasta;
        const abarcaRango = item.fechaInicio <= fechaDesde && item.fechaFin >= fechaHasta;
        matchFecha = inicioEnRango || finEnRango || abarcaRango;
      } else if (fechaDesde) {
        matchFecha = item.fechaFin >= fechaDesde;
      } else if (fechaHasta) {
        matchFecha = item.fechaInicio <= fechaHasta;
      }

      return matchSearch && matchDepto && matchTipo && matchEstatus && matchExcepcion && matchFecha;
    });
  }, [searchTerm, selectedDepto, selectedTipo, selectedEstatus, selectedExcepcion, fechaDesde, fechaHasta]);

  // Recálculo dinámico de KPIs según los filtros activos
  const kpis = useMemo(() => {
    const totalSolicitudes = filteredData.length;
    const totalDias = filteredData.reduce((acc, curr) => acc + curr.dias, 0);
    const pendientes = filteredData.filter((i) => i.estatus === 'Pendiente').length;
    const excepciones = filteredData.filter((i) => i.esExcepcion).length;

    return {
      totalSolicitudes,
      totalDias,
      pendientes,
      excepciones,
    };
  }, [filteredData]);

  // Limpiar todos los filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepto('Todos');
    setSelectedTipo('Todos');
    setSelectedEstatus('Todos');
    setSelectedExcepcion('Todos');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedDepto !== 'Todos' ||
    selectedTipo !== 'Todos' ||
    selectedEstatus !== 'Todos' ||
    selectedExcepcion !== 'Todos' ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta);

  // Exportar a CSV nativo
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    // Encabezados en español
    const headers = [
      'ID Solicitud',
      'No. Nómina',
      'Colaborador',
      'Departamento',
      'Tipo de Ausencia',
      'Fecha Inicio',
      'Fecha Fin',
      'Días Hábiles',
      'Estatus',
      'Es Excepción',
      'Motivo de Excepción',
      'Jefe Directo'
    ];

    // Mapeo de filas
    const rows = filteredData.map((item) => [
      `"${item.id}"`,
      `"${item.nomina}"`,
      `"${item.colaborador.replace(/"/g, '""')}"`,
      `"${item.departamento}"`,
      `"${item.tipo}"`,
      `"${item.fechaInicio}"`,
      `"${item.fechaFin}"`,
      item.dias,
      `"${item.estatus}"`,
      item.esExcepcion ? '"Sí"' : '"No"',
      `"${(item.motivoExcepcion || '').replace(/"/g, '""')}"`,
      `"${item.jefeDirecto || 'No asignado'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    // Usar BOM \uFEFF para que Excel reconozca tildes y caracteres en español
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fechaActual = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Auditoria_TyC_Permisos_${fechaActual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatearFechaVisual = (fechaStr: string) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dia = partes[2];
    const mesIdx = parseInt(partes[1], 10) - 1;
    const anio = partes[0];
    return `${dia}/${meses[mesIdx]}/${anio}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================
          CABECERA DE LA VISTA & ACCIÓN PRINCIPAL DE EXPORTACIÓN
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Panel de Talento y Cultura
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Supervisión institucional, control de excepciones de días inhábiles/saldo y exportación de bitácoras de ausencias.
          </p>
        </div>

        {/* Botón de Exportación CSV */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Descargar archivo compatible con Excel con los filtros aplicados"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a CSV ({filteredData.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TARJETAS DE RESUMEN (KPIs DINÁMICOS)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Solicitudes */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Solicitudes
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {kpis.totalSolicitudes}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Registros bajo los filtros vigentes
            </p>
          </div>
        </div>

        {/* KPI 2: Total Días Ausentes */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Días Ausentes
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-950 tabular-nums">
              {kpis.totalDias}{' '}
              <span className="text-xs font-normal text-indigo-700">días hábiles</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Impacto acumulado en plantilla
            </p>
          </div>
        </div>

        {/* KPI 3: Solicitudes Pendientes */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Por Resolver
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-900 tabular-nums">
              {kpis.pendientes}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {kpis.pendientes === 0 ? 'Sin rezago de jefaturas' : 'Pendientes de aprobación'}
            </p>
          </div>
        </div>

        {/* KPI 4: Alertas de Excepción */}
        <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-xs flex flex-col justify-between bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Alertas Excepción</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-700 tabular-nums flex items-baseline gap-1.5">
              <span>{kpis.excepciones}</span>
              <span className="text-xs font-medium text-red-600">autorizaciones críticas</span>
            </div>
            <p className="text-[11px] text-red-700 mt-0.5 font-medium">
              Omitieron anticipación o saldo regular
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOTOR DE FILTROS AVANZADO
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Filtros de Búsqueda y Auditoría
            </h3>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Buscador */}
          <div className="sm:col-span-2">
            <label className="block text-gray-600 font-medium mb-1">
              Buscar Colaborador o Nómina:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, EMP-00000 o ID de Solicitud..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 2. Selector Departamento */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Departamento:
            </label>
            <select
              value={selectedDepto}
              onChange={(e) => setSelectedDepto(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {departamentos.map((depto) => (
                <option key={depto} value={depto}>
                  {depto}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Selector Tipo */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Tipo de Ausencia:
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="Todos">Todos los Tipos</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Día Flex">Día Flex</option>
              <option value="Home week">Home week</option>
            </select>
          </div>

          {/* 4. Selector Estatus */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Estatus del Permiso:
            </label>
            <select
              value={selectedEstatus}
              onChange={(e) => setSelectedEstatus(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="Todos">Todos los Estatus</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Expirado por Sistema">Expirado por Sistema</option>
            </select>
          </div>

          {/* 5. Selector Auditoría de Excepciones */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Filtro de Excepción:
            </label>
            <select
              value={selectedExcepcion}
              onChange={(e) => setSelectedExcepcion(e.target.value as any)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="Todos">Todas las Solicitudes</option>
              <option value="Solo Excepciones">🚨 Solo con Excepción</option>
              <option value="Regulares">Regulares sin Excepción</option>
            </select>
          </div>

          {/* 6. Rango de Fechas: Desde */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Fecha Desde:
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 7. Rango de Fechas: Hasta */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Fecha Hasta:
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          TABLA DE RESULTADOS (SOLO LECTURA & AUDITORÍA)
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Registros de Permisos Auditables
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mostrando {filteredData.length} de {MOCK_ALL_REQUESTS.length} solicitudes institucionales registradas.
            </p>
          </div>

          <div className="text-xs text-gray-500 font-mono">
            TyC System · Audit Log 2026
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              No se encontraron permisos con los filtros seleccionados
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Intenta ajustando o borrando los criterios de búsqueda para visualizar más solicitudes de ausencias.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">Acciones</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Folio</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Colaborador</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Nómina</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Departamento</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Tipo</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Rango de Fechas</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Días</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Saldo Disp.</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Fecha Sol.</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Comentarios</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Jefe Directo</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredData.map((item) => {
                  const saldoDisp = item.saldoDisponible ?? (item.esExcepcion ? 0 : 10);
                  const sinSaldoODeficit = saldoDisp <= 0 || item.dias > saldoDisp;
                  const esExcepcion = Boolean(item.esExcepcion || sinSaldoODeficit);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        esExcepcion
                          ? 'bg-red-100 hover:bg-red-200/80 border-l-4 border-red-500'
                          : 'hover:bg-gray-50/75'
                      }`}
                    >
                      {/* 1. Acciones (Master-Detail Modo Auditoría - Primera Columna) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-md transition-colors cursor-pointer shadow-xs"
                          title="Ver detalles de la solicitud"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>Revisar</span>
                        </button>
                      </td>

                      {/* 2. Folio */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-gray-500 font-normal text-[13px]">
                          {item.folio || item.id}
                        </span>
                      </td>

                      {/* 2. Colaborador */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-gray-800 text-[13px] leading-tight">
                          {item.colaborador}
                        </span>
                      </td>

                      {/* 3. Nómina */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-gray-600 font-normal text-[13px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {item.nomina}
                        </span>
                      </td>

                      {/* 4. Departamento */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[13px] text-gray-600 font-normal">
                        {item.departamento}
                      </td>

                      {/* 5. Tipo */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700 font-normal text-[13px]">{item.tipo}</span>
                          {item.esExcepcion && (
                            <span
                              className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-mono font-medium"
                              title={item.motivoExcepcion || 'Excepción'}
                            >
                              Excepción
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Rango de Fechas */}
                      <td className="py-2.5 px-3 font-mono text-gray-600 font-normal text-[13px] leading-tight whitespace-nowrap">
                        {formatearFechaVisual(item.fechaInicio)} - {formatearFechaVisual(item.fechaFin)}
                      </td>

                      {/* 7. Días Hábiles */}
                      <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                        <span className="text-gray-700 font-normal text-[13px]">
                          {item.dias} {item.dias === 1 ? 'día' : 'días'}
                        </span>
                      </td>

                      {/* 8. Saldo Disponible (limpio sin badge de 'Déficit') */}
                      <td className="py-2.5 px-3 whitespace-nowrap tabular-nums">
                        {sinSaldoODeficit ? (
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-red-600 font-medium text-[13px] whitespace-nowrap">
                              {saldoDisp <= 0 ? '0 días' : `${saldoDisp} ${saldoDisp === 1 ? 'día' : 'días'}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-normal text-[13px] whitespace-nowrap">
                            {saldoDisp} {saldoDisp === 1 ? 'día' : 'días'}
                          </span>
                        )}
                      </td>

                      {/* 9. Fecha Solicitud */}
                      <td className="py-2.5 px-3 text-gray-600 font-normal text-[13px] whitespace-nowrap">
                        {item.fechaSolicitud || '20/Sep/2026'}
                      </td>

                      {/* 10. Comentarios */}
                      <td className="py-2.5 px-3 text-[13px] whitespace-nowrap">
                        {item.comentarios && item.comentarios.trim().length > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveComment(item.comentarios || null);
                              setActiveCommentAuthor(`${item.colaborador} (${item.folio || item.id})`);
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-normal cursor-pointer transition-colors text-[13px]"
                            title="Ver justificación o comentario del colaborador"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        ) : item.motivoExcepcion ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveComment(item.motivoExcepcion || null);
                              setActiveCommentAuthor(`${item.colaborador} (${item.folio || item.id})`);
                            }}
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 hover:underline font-normal cursor-pointer transition-colors text-[13px]"
                            title="Ver motivo de excepción"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 font-normal">N/A</span>
                        )}
                      </td>

                      {/* 11. Jefe Directo */}
                      <td className="py-2.5 px-3 text-gray-600 text-[13px] whitespace-nowrap font-normal">
                        {item.jefeDirecto || 'Emmanuel Muñoz'}
                      </td>

                      {/* 12. Estatus */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {item.estatus === 'Pendiente' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                            Pendiente
                          </span>
                        )}
                        {item.estatus === 'Aprobada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                            Aprobada
                          </span>
                        )}
                        {item.estatus === 'Rechazada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
                            Rechazada
                          </span>
                        )}
                        {item.estatus === 'Expirado por Sistema' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
                            Expirado
                          </span>
                        )}
                        {item.estatus === 'Cancelada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5" />
                            Cancelada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-gray-50 border-t border-gray-200 p-3 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Panel institucional TyC · Auditoría y Cumplimiento Normativo (LFT)
          </span>
          <span className="text-gray-400 font-mono">
            Exportación generada mediante Blob UTF-8 con soporte de caracteres
          </span>
        </div>
      </div>

      {/* Modal de Vista Detallada de Solicitud (Master-Detail Modo Auditoría) */}
      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRequestForModal(null);
        }}
        request={selectedRequestForModal}
        isReadOnly={true}
      />

      {/* ========================================================
          MODAL: Ver Comentarios / Justificación en TyC
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
                Justificación / Nota Institucional:
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                "{activeComment}"
              </div>
            </div>

            {/* Pie del modal con botón Cerrar */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveComment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TyCReportsView;
