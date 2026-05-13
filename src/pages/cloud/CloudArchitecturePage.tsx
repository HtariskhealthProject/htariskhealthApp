import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import {
  Cloud,
  Database,
  Shield,
  Lock,
  Server,
  Monitor,
  FileText,
  Activity,
  HardDrive,
  Globe,
  ArrowRight,
  Layers,
  Eye,
} from 'lucide-react';

const layers = [
  {
    tier: 'Presentacion',
    color: 'clinical',
    items: [
      {
        icon: <Monitor className="w-5 h-5" />,
        title: 'Frontend React + TypeScript',
        description: 'SPA construida con React 18, TypeScript, Tailwind CSS y Vite. Desplegada en Vercel/Netlify como sitio estatico con CDN global.',
        tech: 'React 18 / TypeScript / Vite / Tailwind CSS',
      },
      {
        icon: <Globe className="w-5 h-5" />,
        title: 'Despliegue Cloud (CDN)',
        description: 'Build estatico distribuido via CDN con SSL/TLS automatico. Dominio personalizado y previews por rama.',
        tech: 'Vercel / Netlify / HTTPS / CDN',
      },
    ],
  },
  {
    tier: 'Servicios Cloud (Supabase)',
    color: 'emerald',
    items: [
      {
        icon: <Shield className="w-5 h-5" />,
        title: 'Supabase Auth',
        description: 'Autenticacion de usuarios con email/password. Gestiona sesiones JWT, roles (medico/enfermera) y proteccion de rutas.',
        tech: 'JWT / Row Level Security / Roles',
      },
      {
        icon: <Database className="w-5 h-5" />,
        title: 'Supabase PostgreSQL',
        description: 'Base de datos relacional cloud para pacientes, mediciones y logs de auditoria. Politicas RLS por usuario autenticado.',
        tech: 'PostgreSQL / RLS / Foreign Keys / Indexes',
      },
      {
        icon: <HardDrive className="w-5 h-5" />,
        title: 'Supabase Storage',
        description: 'Almacenamiento de objetos para evidencias clinicas, soportes documentales y archivos adjuntos del expediente.',
        tech: 'S3-compatible / Buckets / Signed URLs',
      },
    ],
  },
  {
    tier: 'Logica y Trazabilidad',
    color: 'amber',
    items: [
      {
        icon: <Activity className="w-5 h-5" />,
        title: 'Motor de Clasificacion',
        description: 'Clasificacion automatizada de presion arterial segun guias AHA/ACC 2025. Calculo de PAM, riesgo y recomendaciones.',
        tech: 'Reglas clinicas / AHA 2025 / PAM',
      },
      {
        icon: <Eye className="w-5 h-5" />,
        title: 'AuditService (Trazabilidad)',
        description: 'Registro inmutable de acciones clinicas: creacion de pacientes, mediciones, ediciones, reportes y sesiones.',
        tech: 'Audit Logs / Timestamps / User tracking',
      },
      {
        icon: <FileText className="w-5 h-5" />,
        title: 'Reportes y Estadisticas',
        description: 'Generacion de reportes clinicos a partir de datos historicos. Distribucion por categorias, tendencias y hallazgos.',
        tech: 'Recharts / Agregaciones SQL / Export',
      },
    ],
  },
  {
    tier: 'Seguridad',
    color: 'red',
    items: [
      {
        icon: <Lock className="w-5 h-5" />,
        title: 'Variables de Entorno',
        description: 'Credenciales y configuracion gestionadas mediante variables de entorno (.env). Sin claves en el codigo fuente.',
        tech: '.env / VITE_* / Git-ignored',
      },
      {
        icon: <Layers className="w-5 h-5" />,
        title: 'Row Level Security (RLS)',
        description: 'Politicas de seguridad a nivel de fila en PostgreSQL. Cada usuario solo accede a datos autorizados.',
        tech: 'Supabase RLS / auth.uid() / Policies',
      },
    ],
  },
];

const flowSteps = [
  { label: 'Usuario', icon: <Monitor className="w-4 h-4" /> },
  { label: 'React SPA', icon: <Globe className="w-4 h-4" /> },
  { label: 'Supabase Auth', icon: <Shield className="w-4 h-4" /> },
  { label: 'PostgreSQL', icon: <Database className="w-4 h-4" /> },
  { label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
];

const tierColorMap: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  clinical: { bg: 'bg-clinical-50', border: 'border-clinical-200', badge: 'bg-clinical-100', badgeText: 'text-clinical-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100', badgeText: 'text-amber-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100', badgeText: 'text-red-700' },
};

export default function CloudArchitecturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Arquitectura Cloud"
        subtitle="Infraestructura y servicios del sistema HTA Cloud"
        icon={<Cloud className="w-5 h-5" />}
      />

      {/* Data Flow Diagram */}
      <SectionCard title="Flujo de Datos" subtitle="Recorrido de una peticion en la arquitectura cloud" icon={<Activity className="w-4 h-4" />}>
        <div className="flex items-center justify-center gap-2 py-4 overflow-x-auto">
          {flowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className="w-10 h-10 rounded-xl bg-clinical-100 flex items-center justify-center text-clinical-700">
                  {step.icon}
                </div>
                <span className="text-xs font-medium text-slate-700 text-center">{step.label}</span>
              </div>
              {i < flowSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Architecture Layers */}
      {layers.map((layer) => {
        const c = tierColorMap[layer.color];
        return (
          <div key={layer.tier}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${c.badge} ${c.badgeText}`}>
                {layer.tier}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layer.items.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl border p-5 ${c.bg} ${c.border}`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${c.badge} flex items-center justify-center ${c.badgeText}`}>
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-xs text-slate-500 font-mono">{item.tech}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Supabase Services Detail */}
      <SectionCard title="Servicios Supabase" subtitle="Detalle de los servicios cloud utilizados" icon={<Server className="w-4 h-4" />}>
        <div className="space-y-4">
          <ServiceRow
            name="Supabase Auth"
            description="Gestiona registro, login, sesiones JWT y roles de usuario (medico/enfermera). Protege rutas y datos mediante tokens."
            endpoint="auth.users"
            status="Activo"
          />
          <ServiceRow
            name="Supabase PostgreSQL"
            description="Almacena pacientes, mediciones de presion arterial, logs de auditoria y datos clinicos. Politicas RLS restringen acceso por usuario."
            endpoint="public.*"
            status="Activo"
          />
          <ServiceRow
            name="Supabase Storage"
            description="Buckets para almacenar evidencias clinicas, soportes documentales y archivos adjuntos. Acceso mediante URLs firmadas."
            endpoint="storage.objects"
            status="Configurado"
          />
          <ServiceRow
            name="Audit Logs"
            description="Registro inmutable de acciones: creacion de pacientes, mediciones, ediciones, reportes generados y sesiones."
            endpoint="audit_logs"
            status="Activo"
          />
        </div>
      </SectionCard>

      {/* Environment & Security */}
      <SectionCard title="Seguridad y Configuracion" subtitle="Buenas practicas de seguridad implementadas" icon={<Lock className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Variables de Entorno</h4>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-clinical-500 mt-2 flex-shrink-0" />
                <span><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> - URL del proyecto Supabase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-clinical-500 mt-2 flex-shrink-0" />
                <span><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> - Clave publica anonima</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-clinical-500 mt-2 flex-shrink-0" />
                <span>Archivo <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env</code> excluido de Git</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Politicas de Seguridad</h4>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Row Level Security (RLS) en todas las tablas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Autenticacion JWT con verificacion en cada peticion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Sin claves secretas en el codigo fuente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>Trazabilidad completa de acciones clinicas</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ServiceRow({ name, description, endpoint, status }: {
  name: string;
  description: string;
  endpoint: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg border border-slate-200 bg-white">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-slate-800">{name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="text-xs text-slate-400 mt-1 font-mono">{endpoint}</p>
      </div>
    </div>
  );
}
