import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Shield,
  KeyRound,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Building2,
  MapPin,
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  Lock,
  Layers
} from 'lucide-react';
import TyCBalanceEditorView from './TyCBalanceEditorView';
import MinimalAlertModal, { AlertModalState } from './MinimalAlertModal';

// ==========================================
// TIPOS Y MOCKS PARA MÓDULO 2: CONTROL DE ACCESOS
// ==========================================
export type UserRole = 'Generalista TyC' | 'Centro de Servicios';

export interface EmployeeAccessRecord {
  nomina: string;
  nombre: string;
  departamento: string;
  puesto: string;
  roles: UserRole[];
}

const MOCK_ACCESS_EMPLOYEES: EmployeeAccessRecord[] = [
  // --- Equipo de Centro de Servicios (Super Admins) ---
  {
    nomina: 'EMP-04829',
    nombre: 'Fernando Carrillo',
    departamento: 'Centro de Servicios',
    puesto: 'Analista de Compensaciones',
    roles: ['Centro de Servicios'],
  },
  {
    nomina: 'EMP-08812',
    nombre: 'Emmanuel Muñoz',
    departamento: 'Centro de Servicios',
    puesto: 'Gerente de Centro de Servicios',
    roles: ['Generalista TyC', 'Centro de Servicios'],
  },
  {
    nomina: 'EMP-21059',
    nombre: 'Erik Fabian Limas Arriaga',
    departamento: 'Centro de Servicios',
    puesto: 'Centro de Servicios',
    roles: ['Centro de Servicios'],
  },

  // --- Equipo de Generalistas TyC ---
  {
    nomina: 'EMP-19369',
    nombre: 'Edith Betina Arias Gonzalez',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },
  {
    nomina: 'EMP-17028',
    nombre: 'Mary Bell Pascual Cervantes',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },
  {
    nomina: 'EMP-20509',
    nombre: 'Jose Luis Fernández Rodríguez',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },
  {
    nomina: 'EMP-16746',
    nombre: 'Ana Karen Estrada Beltran',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },
  {
    nomina: 'EMP-06437',
    nombre: 'Mayra Raquel Juarez Torres',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },
  {
    nomina: 'EMP-18148',
    nombre: 'Daniela Lizbeth Casas Gaona',
    departamento: 'Talento y Cultura',
    puesto: 'Generalista TyC',
    roles: ['Generalista TyC'],
  },

  // --- Colaboradores Regulares (Disponibles para Promover en Búsqueda) ---
  {
    nomina: 'EMP-05309',
    nombre: 'Alejandro Morales Cruz',
    departamento: 'Ingeniería y TI',
    puesto: 'Ingeniero de Software Senior',
    roles: [],
  },
  {
    nomina: 'EMP-03881',
    nombre: 'Carlos Mendoza Silva',
    departamento: 'Finanzas Corporativas',
    puesto: 'Especialista Contable',
    roles: [],
  },
  {
    nomina: 'EMP-02194',
    nombre: 'Mariana Ríos Domínguez',
    departamento: 'Operaciones y Logística',
    puesto: 'Coordinadora de Distribución',
    roles: [],
  },
  {
    nomina: 'EMP-06720',
    nombre: 'Rodrigo Nava Esquivel',
    departamento: 'Comercial y Ventas',
    puesto: 'Ejecutivo de Cuentas Clave',
    roles: [],
  },
  {
    nomina: 'EMP-01928',
    nombre: 'Sofía Rivera Gómez',
    departamento: 'Operaciones y Logística',
    puesto: 'Directora de Cadena de Suministro',
    roles: [],
  },
];

// ==========================================
// TIPOS Y MOCKS PARA MÓDULO 3: CONTRASEÑAS SIN CORREO
// ==========================================
export interface OperationalEmployee {
  nomina: string;
  nombre: string;
  departamento: string;
  puesto: string;
  planta: string;
  tieneEmail: boolean;
}

const MOCK_OPERATIONAL_EMPLOYEES: OperationalEmployee[] = [
  {
    nomina: 'EMP-09101',
    nombre: 'Juan Manuel Torres Sánchez',
    departamento: 'Producción Avícola',
    puesto: 'Operador de Línea Calificada',
    planta: 'Planta Monterrey (Santa Rosa)',
    tieneEmail: false,
  },
  {
    nomina: 'EMP-09102',
    nombre: 'María Guadalupe Ramos Meza',
    departamento: 'Empaque y Embalaje',
    puesto: 'Operadora de Maquinaria Selladora',
    planta: 'Planta San Luis Potosí',
    tieneEmail: false,
  },
  {
    nomina: 'EMP-09103',
    nombre: 'Pedro Antonio Beltrán Lozano',
    departamento: 'Mantenimiento General',
    puesto: 'Técnico Mecánico de Turno',
    planta: 'Planta Tijuana',
    tieneEmail: false,
  },
  {
    nomina: 'EMP-09104',
    nombre: 'Rosa Isela Zambrano Castillo',
    departamento: 'Almacén y Embarque',
    puesto: 'Estibadora de Andén',
    planta: 'Cedis Ciudad de México',
    tieneEmail: false,
  },
  {
    nomina: 'EMP-09105',
    nombre: 'José Carmen Mendoza Huerta',
    departamento: 'Procesamiento Secundario',
    puesto: 'Operador de Deshuese',
    planta: 'Planta Querétaro',
    tieneEmail: false,
  },
];

// ==========================================
// TIPOS Y MOCKS PARA MÓDULO 4: ASIGNACIÓN DE GENERALISTAS
// ==========================================
export interface GeneralistAssignment {
  id: string;
  nombre: string;
  email: string;
  centrosTrabajo: string[];
  areas: string[];
}

const MOCK_GENERALISTS: GeneralistAssignment[] = [
  {
    id: 'GEN-001',
    nombre: 'Edith Betina Arias Gonzalez',
    email: 'ebetina.arias@ayvi.com.mx',
    centrosTrabajo: ['MEXICO', 'SAN LUIS POTOSI', 'TIJUANA', 'TORREON', 'LEON', 'QUERETARO'],
    areas: [],
  },
  {
    id: 'GEN-002',
    nombre: 'Mary Bell Pascual Cervantes',
    email: 'mbell.pascual@ayvi.com.mx',
    centrosTrabajo: ['MEXICO SUR', 'TOLUCA', 'PUEBLA', 'GUADALAJARA', 'VERACRUZ'],
    areas: [],
  },
  {
    id: 'GEN-003',
    nombre: 'Jose Luis Fernández Rodríguez',
    email: 'jlfernandez@ayvi.com.mx',
    centrosTrabajo: ['SANTA ROSA DETALLE', 'FRIALSA SANTA ROSA', 'VIA MATAMOROS', 'MONCLOVA'],
    areas: [],
  },
  {
    id: 'GEN-004',
    nombre: 'Ana Karen Estrada Beltran',
    email: 'akaren.estrada@ayvi.com.mx',
    centrosTrabajo: ['AGAMI', 'CENTRAL DE ABASTOS', 'SANTA CATARINA', 'SAN NICOLAS'],
    areas: [],
  },
  {
    id: 'GEN-005',
    nombre: 'Mayra Raquel Juarez Torres',
    email: 'mraquel.juarez@ayvi.com.mx',
    centrosTrabajo: ['SANTA ROSA'],
    areas: [
      'DESCONGELADO',
      'PREFORMADO PROCESO',
      'POLLO EMPAQUE',
      'PAVO',
      'POLLO (L3)',
      'PREFORMADO EMPAQUE',
      'POLLO PROCESO',
      'SANIDAD',
    ],
  },
  {
    id: 'GEN-006',
    nombre: 'Daniela Lizbeth Casas Gaona',
    email: 'dlizbeth.casas@ayvi.com.mx',
    centrosTrabajo: ['SANTA ROSA'],
    areas: [],
  },
];

export const AdminSettingsView: React.FC = () => {
  // Estado de Navegación del Menú Lateral (Sidebar)
  const [activeModule, setActiveModule] = useState<
    'saldos' | 'accesos' | 'contrasenas' | 'generalistas'
  >('saldos');

  // Modal Minimalista de Notificación
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // ==========================================
  // ESTADOS MÓDULO 2: CONTROL DE ACCESOS
  // ==========================================
  const [accessEmployees, setAccessEmployees] = useState<EmployeeAccessRecord[]>(MOCK_ACCESS_EMPLOYEES);
  const [accessSearch, setAccessSearch] = useState('');
  const [editingAccessEmp, setEditingAccessEmp] = useState<EmployeeAccessRecord | null>(null);

  // Roles administrativos editables en el estado temporal
  const [tempAdminRoles, setTempAdminRoles] = useState<UserRole[]>([]);

  // 1. Filtrado de Administradores Activos (poseen Generalista TyC o Centro de Servicios)
  const activeAdmins = useMemo(() => {
    return accessEmployees.filter(
      (emp) => emp.roles.includes('Generalista TyC') || emp.roles.includes('Centro de Servicios')
    );
  }, [accessEmployees]);

  // Búsqueda en administradores activos
  const filteredActiveAdmins = useMemo(() => {
    if (!accessSearch.trim()) return activeAdmins;
    const query = accessSearch.toLowerCase().trim();
    return activeAdmins.filter(
      (emp) =>
        emp.nombre.toLowerCase().includes(query) ||
        emp.nomina.toLowerCase().includes(query)
    );
  }, [activeAdmins, accessSearch]);

  // 2. Búsqueda de Colaboradores Regulares para "Promover" (Search-to-Add)
  const regularEmployeesFound = useMemo(() => {
    if (!accessSearch.trim()) return [];
    const query = accessSearch.toLowerCase().trim();
    return accessEmployees.filter((emp) => {
      const isAlreadyAdmin =
        emp.roles.includes('Generalista TyC') || emp.roles.includes('Centro de Servicios');
      if (isAlreadyAdmin) return false;
      return (
        emp.nombre.toLowerCase().includes(query) ||
        emp.nomina.toLowerCase().includes(query)
      );
    });
  }, [accessEmployees, accessSearch]);

  const handleOpenEditAccess = (emp: EmployeeAccessRecord) => {
    setEditingAccessEmp(emp);
    setTempAdminRoles([...emp.roles]);
  };

  const handleToggleAdminRole = (role: UserRole) => {
    if (tempAdminRoles.includes(role)) {
      setTempAdminRoles(tempAdminRoles.filter((r) => r !== role));
    } else {
      setTempAdminRoles([...tempAdminRoles, role]);
    }
  };

  const handleSaveAccessRoles = () => {
    if (!editingAccessEmp) return;

    setAccessEmployees((prev) =>
      prev.map((e) => (e.nomina === editingAccessEmp.nomina ? { ...e, roles: tempAdminRoles } : e))
    );

    const fuePromovido =
      editingAccessEmp.roles.length === 0 &&
      tempAdminRoles.length > 0;

    setAlertModal({
      isOpen: true,
      title: fuePromovido ? 'Colaborador Promovido a Administrador' : 'Permisos Actualizados',
      message: fuePromovido
        ? `Se han asignado facultades administrativas a ${editingAccessEmp.nombre} (${editingAccessEmp.nomina}). Ahora figura en la tabla de administradores activos.`
        : `Los permisos para ${editingAccessEmp.nombre} (${editingAccessEmp.nomina}) se guardaron exitosamente.`,
      type: 'success',
    });

    setEditingAccessEmp(null);
  };

  // ==========================================
  // ESTADOS MÓDULO 3: CONTRASEÑAS SIN CORREO
  // ==========================================
  const [searchNominaPassword, setSearchNominaPassword] = useState('');
  const [selectedOperationalEmp, setSelectedOperationalEmp] = useState<OperationalEmployee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSearchOperationalEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    const query = searchNominaPassword.trim().toUpperCase();
    const found = MOCK_OPERATIONAL_EMPLOYEES.find(
      (emp) => emp.nomina.toUpperCase() === query || emp.nomina.replace('EMP-', '') === query
    );
    if (found) {
      setSelectedOperationalEmp(found);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setSelectedOperationalEmp(null);
      setPasswordError(`No se encontró personal operativo con la nómina "${searchNominaPassword}". Prueba con EMP-09101, EMP-09102 o EMP-09103.`);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperationalEmp) return;
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setPasswordError('');
    setAlertModal({
      isOpen: true,
      title: 'Credenciales Actualizadas',
      message: `Se ha reestablecido exitosamente la contraseña de acceso para ${selectedOperationalEmp.nombre} (${selectedOperationalEmp.nomina}). El colaborador ya puede iniciar sesión en terminales operativas.`,
      type: 'success',
    });
    setNewPassword('');
    setConfirmPassword('');
    setSelectedOperationalEmp(null);
    setSearchNominaPassword('');
  };

  // ==========================================
  // ESTADOS MÓDULO 4: ASIGNACIÓN DE GENERALISTAS
  // ==========================================
  const [generalists, setGeneralists] = useState<GeneralistAssignment[]>(MOCK_GENERALISTS);
  const [editingGeneralist, setEditingGeneralist] = useState<GeneralistAssignment | null>(null);
  const [newCenterInput, setNewCenterInput] = useState('');
  const [newAreaInput, setNewAreaInput] = useState('');

  const handleOpenEditGeneralist = (gen: GeneralistAssignment) => {
    setEditingGeneralist({ ...gen, centrosTrabajo: [...gen.centrosTrabajo], areas: [...gen.areas] });
    setNewCenterInput('');
    setNewAreaInput('');
  };

  const handleAddCenter = () => {
    if (!editingGeneralist || !newCenterInput.trim()) return;
    if (!editingGeneralist.centrosTrabajo.includes(newCenterInput.trim())) {
      setEditingGeneralist({
        ...editingGeneralist,
        centrosTrabajo: [...editingGeneralist.centrosTrabajo, newCenterInput.trim()],
      });
    }
    setNewCenterInput('');
  };

  const handleRemoveCenter = (center: string) => {
    if (!editingGeneralist) return;
    setEditingGeneralist({
      ...editingGeneralist,
      centrosTrabajo: editingGeneralist.centrosTrabajo.filter((c) => c !== center),
    });
  };

  const handleAddArea = () => {
    if (!editingGeneralist || !newAreaInput.trim()) return;
    const trimmedArea = newAreaInput.trim().toUpperCase();
    if (!editingGeneralist.areas.includes(trimmedArea)) {
      setEditingGeneralist({
        ...editingGeneralist,
        areas: [...editingGeneralist.areas, trimmedArea],
      });
    }
    setNewAreaInput('');
  };

  const handleRemoveArea = (area: string) => {
    if (!editingGeneralist) return;
    setEditingGeneralist({
      ...editingGeneralist,
      areas: editingGeneralist.areas.filter((a) => a !== area),
    });
  };

  const handleSaveGeneralistAssignment = () => {
    if (!editingGeneralist) return;
    setGeneralists((prev) =>
      prev.map((g) => (g.id === editingGeneralist.id ? editingGeneralist : g))
    );
    setAlertModal({
      isOpen: true,
      title: 'Asignación Actualizada',
      message: `Se actualizaron los centros de trabajo y áreas operativas de ${editingGeneralist.nombre}.`,
      type: 'success',
    });
    setEditingGeneralist(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================
          ENCABEZADO DE LA VISTA MAESTRA (SUPER ADMIN)
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Panel de Modificación Manual y Configuración
          </h2>
        </div>
      </div>

      {/* ========================================================
          LAYOUT: SIDEBAR VERTICAL TABS + CONTENIDO PRINCIPAL
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            BARRA LATERAL DE NAVEGACIÓN (VERTICAL TABS)
            ======================================================== */}
        <aside className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-2">
            Módulos Administrativos
          </p>
          <nav className="space-y-1">
            {/* Opción 1: Gestión de Saldos y Ajustes Manuales
 */}
            <button
              type="button"
              onClick={() => setActiveModule('saldos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                activeModule === 'saldos'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-600 font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeModule === 'saldos' ? 'text-purple-700' : 'text-gray-400'}`} />
              <div className="flex-1">
                <span>Gestión de Saldos y Ajustes Manuales</span>
                <span className="block text-[10px] font-normal text-gray-400">Conciliación de días</span>
              </div>
            </button>

            {/* Opción 2: Control de Accesos */}
            <button
              type="button"
              onClick={() => setActiveModule('accesos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                activeModule === 'accesos'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-600 font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeModule === 'accesos' ? 'text-purple-700' : 'text-gray-400'}`} />
              <div className="flex-1">
                <span>Control de Accesos</span>
                <span className="block text-[10px] font-normal text-gray-400">Roles y permisos de vistas</span>
              </div>
            </button>

            {/* Opción 3: Contraseñas (Sin Correo) */}
            <button
              type="button"
              onClick={() => setActiveModule('contrasenas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                activeModule === 'contrasenas'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-600 font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <KeyRound className={`w-4 h-4 ${activeModule === 'contrasenas' ? 'text-purple-700' : 'text-gray-400'}`} />
              <div className="flex-1">
                <span>Contraseñas (Sin Correo)</span>
                <span className="block text-[10px] font-normal text-gray-400">Personal de planta</span>
              </div>
            </button>

            {/* Opción 4: Asignación de Generalistas */}
            <button
              type="button"
              onClick={() => setActiveModule('generalistas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                activeModule === 'generalistas'
                  ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-600 font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users className={`w-4 h-4 ${activeModule === 'generalistas' ? 'text-purple-700' : 'text-gray-400'}`} />
              <div className="flex-1">
                <span>Asignación de Generalistas</span>
                <span className="block text-[10px] font-normal text-gray-400">Centros de trabajo y áreas</span>
              </div>
            </button>
          </nav>
        </aside>

        {/* ========================================================
            ÁREA DE CONTENIDO A LA DERECHA
            ======================================================== */}
        <div className="lg:col-span-9">
          {/* ====================================================
              MÓDULO 1: SALDOS Y BITÁCORA (REUTILIZACIÓN COMPONENTE)
              ==================================================== */}
          {activeModule === 'saldos' && (
            <div className="space-y-4 animate-fadeIn">
              <TyCBalanceEditorView />
            </div>
          )}

          {/* ====================================================
              MÓDULO 2: CONTROL DE ACCESOS A VISTAS
              ==================================================== */}
          {activeModule === 'accesos' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Tarjeta de encabezado y buscador Search-to-Add */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-700" />
                      <span>Control de Accesos a Vistas y Módulos</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Administración de permisos especiales para Generalistas de TyC y Centro de Servicios.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 shrink-0 self-start sm:self-auto">
                    {activeAdmins.length} Administrador(es) Activo(s)
                  </span>
                </div>

                {/* Buscador Prominente (Search-to-Add) */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar administrador o ingresar nómina para promover colaborador (ej. Carlos, EMP-03881)..."
                    value={accessSearch}
                    onChange={(e) => setAccessSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 hover:bg-white transition-colors"
                  />
                  {accessSearch && (
                    <button
                      type="button"
                      onClick={() => setAccessSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* TARJETA TEMPORAL PARA "PROMOVER" COLABORADORES REGULARES (SEARCH-TO-ADD) */}
              {accessSearch.trim() && regularEmployeesFound.length > 0 && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 shadow-xs animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-purple-700" />
                      <span>Colaborador(es) regular(es) encontrado(s) — Listo(s) para promover</span>
                    </span>
                    <span className="text-[11px] text-purple-700 font-mono font-medium">
                      {regularEmployeesFound.length} coincidencia(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {regularEmployeesFound.map((regEmp) => (
                      <div
                        key={regEmp.nomina}
                        className="bg-white border border-purple-100 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-purple-300 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {regEmp.nombre}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono truncate">
                            {regEmp.nomina} · {regEmp.puesto}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditAccess(regEmp)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Asignar Permisos</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TABLA DE ADMINISTRADORES ACTIVOS (FILTRADA) */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Administradores Activos con Permisos Especiales
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Mostrando {filteredActiveAdmins.length} colaborador(es) con facultades de Generalista TyC o Centro de Servicios.
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    Matriz RBAC · Intelexion HR
                  </span>
                </div>

                {filteredActiveAdmins.length === 0 ? (
                  <div className="p-12 text-center">
                    <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-900">
                      No se encontraron administradores con ese criterio
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Si buscas a un colaborador para otorgarle permisos administrativos, revisa la sección de colaboradores encontrados arriba para promoverlo.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[13px] table-auto">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3.5 whitespace-nowrap">Colaborador</th>
                          <th className="py-2.5 px-3.5 whitespace-nowrap">Nómina</th>
                          <th className="py-2.5 px-3.5 whitespace-nowrap">Roles Asignados</th>
                          <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredActiveAdmins.map((emp) => (
                          <tr key={emp.nomina} className="hover:bg-purple-50/30 transition-colors">
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-semibold text-gray-900 block">{emp.nombre}</span>
                              <span className="text-[11px] text-gray-500 font-normal">{emp.puesto} · {emp.departamento}</span>
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap font-mono text-gray-500">
                              {emp.nomina}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* Roles Administrativos Especiales */}
                                {emp.roles.includes('Generalista TyC') && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    Generalista TyC
                                  </span>
                                )}

                                {emp.roles.includes('Centro de Servicios') && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                    Centro de Servicios
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAccess(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar Roles</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODAL DE EDICIÓN DE ROLES RESTRINGIDO */}
              {editingAccessEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4 animate-scaleUp">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Asignar Roles Administrativos
                        </h4>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {editingAccessEmp.nomina} · {editingAccessEmp.nombre}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAccessEmp(null)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Checkboxes editables: Solo Generalista TyC y Centro de Servicios */}
                    <div className="space-y-2.5 pt-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Roles y facultades editables (Super Admin):
                      </p>

                      {/* Checkbox 1: Generalista TyC */}
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tempAdminRoles.includes('Generalista TyC')}
                          onChange={() => handleToggleAdminRole('Generalista TyC')}
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-900">Generalista (Talento y Cultura)</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Habilita la pestaña de <strong>Auditoría TyC</strong> para consultar reportes y registros institucionales.
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 2: Centro de Servicios */}
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-purple-200 bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tempAdminRoles.includes('Centro de Servicios')}
                          onChange={() => handleToggleAdminRole('Centro de Servicios')}
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-semibold text-purple-950">Centro de Servicios (Super Admin)</p>
                          <p className="text-[11px] text-purple-700 mt-0.5">
                            Habilita el panel de <strong>Modificación Manual</strong> para ajustes de saldo, contraseñas y permisos.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setEditingAccessEmp(null)}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAccessRoles}
                        className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs cursor-pointer"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              MÓDULO 3: MODIFICAR CONTRASEÑAS (USUARIOS SIN CORREO)
              ==================================================== */}
          {activeModule === 'contrasenas' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-700" />
                  <span>Modificación de Contraseñas (Personal Operativo Sin Correo)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
                  Permite a Centro de Servicios reestablecer manualmente el acceso al portal a trabajadores de planta, almacén y líneas de producción que no cuentan con correo corporativo.
                </p>

                {/* Buscador Search-First por Nómina */}
                <form onSubmit={handleSearchOperationalEmployee} className="mt-4 flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ingresa Número de Nómina (ej. EMP-09101)..."
                      value={searchNominaPassword}
                      onChange={(e) => setSearchNominaPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                  >
                    Buscar
                  </button>
                </form>

                {/* Sugerencias de Nóminas Operativas para prueba */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                  <span>Prueba con nóminas de planta:</span>
                  {['EMP-09101', 'EMP-09102', 'EMP-09103'].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setSearchNominaPassword(nom)}
                      className="font-mono text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 cursor-pointer"
                    >
                      {nom}
                    </button>
                  ))}
                </div>

                {passwordError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Tarjeta del Colaborador Encontrado y Formulario de Cambio de Contraseña */}
              {selectedOperationalEmp && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs animate-scaleUp max-w-lg space-y-4">
                  <div className="pb-3 border-b border-gray-100 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-200">
                        USUARIO SIN CORREO ELECTRÓNICO
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">
                        {selectedOperationalEmp.nombre}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {selectedOperationalEmp.puesto} · {selectedOperationalEmp.planta}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                      {selectedOperationalEmp.nomina}
                    </span>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres..."
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirmar Contraseña <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Actualizar Credenciales de Acceso</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              MÓDULO 4: ASIGNACIÓN DE GENERALISTAS (CENTROS DE TRABAJO)
              ==================================================== */}
          {activeModule === 'generalistas' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-700" />
                  <span>Mapeo y Asignación de Generalistas TyC</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
                  Configura la cobertura territorial y operativa de los Generalistas de Talento y Cultura para asignación de centros de trabajo (ciudades/plantas) y áreas operativas.
                </p>
              </div>

              {/* Grid de Tarjetas de Generalistas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalists.map((gen) => (
                  <div
                    key={gen.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{gen.nombre}</h4>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{gen.email}</p>
                        </div>
                        <span className="text-[10px] font-mono bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
                          {gen.id}
                        </span>
                      </div>

                      {/* Centros de Trabajo Asignados */}
                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          <span>Centros de Trabajo ({gen.centrosTrabajo.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {gen.centrosTrabajo.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[11px] font-medium rounded-md"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Áreas Asignadas (Condicional: Oculto si el arreglo está vacío) */}
                      {gen.areas && gen.areas.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Áreas Asignadas ({gen.areas.length})</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {gen.areas.map((a) => (
                              <span
                                key={a}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium rounded-md"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGeneralist(gen)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar Asignación</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal para Editar Asignaciones del Generalista */}
              {editingGeneralist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden p-6 space-y-4 animate-scaleUp">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Editar Cobertura de Generalista
                          </h4>
                          <p className="text-xs text-gray-500">{editingGeneralist.nombre}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingGeneralist(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Centros de Trabajo (Tags editables) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Centros de Trabajo / Plantas
                          </label>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {editingGeneralist.centrosTrabajo.length} asignado(s)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-8 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                          {editingGeneralist.centrosTrabajo.length === 0 ? (
                            <span className="text-xs text-gray-400 italic py-0.5">
                              Sin centros asignados
                            </span>
                          ) : (
                            editingGeneralist.centrosTrabajo.map((center) => (
                              <span
                                key={center}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-md shadow-2xs"
                              >
                                <span>{center}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCenter(center)}
                                  className="text-gray-400 hover:text-red-600 cursor-pointer ml-0.5"
                                  title={`Eliminar ${center}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            list="centros-sugeridos"
                            placeholder="Agregar centro (ej. Santa Rosa, Querétaro, Tijuana)..."
                            value={newCenterInput}
                            onChange={(e) => setNewCenterInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCenter())}
                            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          />
                          <datalist id="centros-sugeridos">
                            <option value="MEXICO" />
                            <option value="SAN LUIS POTOSI" />
                            <option value="TIJUANA" />
                            <option value="TORREON" />
                            <option value="LEON" />
                            <option value="QUERETARO" />
                            <option value="MEXICO SUR" />
                            <option value="TOLUCA" />
                            <option value="PUEBLA" />
                            <option value="GUADALAJARA" />
                            <option value="VERACRUZ" />
                            <option value="SANTA ROSA" />
                            <option value="SANTA ROSA DETALLE" />
                            <option value="FRIALSA SANTA ROSA" />
                            <option value="VIA MATAMOROS" />
                            <option value="MONCLOVA" />
                            <option value="AGAMI" />
                            <option value="CENTRAL DE ABASTOS" />
                            <option value="SANTA CATARINA" />
                            <option value="SAN NICOLAS" />
                          </datalist>
                          <button
                            type="button"
                            onClick={handleAddCenter}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {/* Áreas Operativas (Opcional) - Siempre activo y escalable */}
                      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-purple-700" />
                            <span>Áreas Operativas (Opcional)</span>
                          </label>
                          <span className="text-[10px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {editingGeneralist.areas.length} asignada(s)
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-snug">
                          Utiliza este campo opcional para subdividir plantas grandes o especificar líneas de producción (ej. divisiones de Santa Rosa).
                        </p>
                        <div className="flex flex-wrap gap-1.5 min-h-8 p-2 bg-white border border-gray-200 rounded-lg shadow-2xs">
                          {editingGeneralist.areas.length === 0 ? (
                            <span className="text-xs text-gray-400 italic py-0.5">
                              Sin áreas específicas asignadas (opcional)
                            </span>
                          ) : (
                            editingGeneralist.areas.map((area) => (
                              <span
                                key={area}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-md"
                              >
                                <span>{area}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveArea(area)}
                                  className="text-blue-400 hover:text-red-600 cursor-pointer ml-0.5"
                                  title={`Eliminar ${area}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            list="areas-sugeridas"
                            placeholder="Agregar área o subdivisión..."
                            value={newAreaInput}
                            onChange={(e) => setNewAreaInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <datalist id="areas-sugeridas">
                            <option value="DESCONGELADO" />
                            <option value="PREFORMADO PROCESO" />
                            <option value="POLLO EMPAQUE" />
                            <option value="PAVO" />
                            <option value="POLLO (L3)" />
                            <option value="PREFORMADO EMPAQUE" />
                            <option value="POLLO PROCESO" />
                            <option value="SANIDAD" />
                            <option value="SANTA ROSA DETALLE" />
                            <option value="PROCESADOS" />
                            <option value="MANTENIMIENTO GENERAL" />
                          </datalist>
                          <button
                            type="button"
                            onClick={handleAddArea}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
                          >
                            Agregar Área
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setEditingGeneralist(null)}
                          className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveGeneralistAssignment}
                          className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs cursor-pointer"
                        >
                          Guardar Asignación
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

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

export default AdminSettingsView;
