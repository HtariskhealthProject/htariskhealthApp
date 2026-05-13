import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Shield, Database, Cloud, Server, Save, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import ClinicalAlert from '../../components/ui/ClinicalAlert';

export default function SettingsPage() {
  const { user } = useAuth();

  const [editName, setEditName] = useState(user?.full_name ?? '');
  const [editLicense, setEditLicense] = useState(user?.license_number ?? '');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setEditName(user?.full_name ?? '');
    setEditLicense(user?.license_number ?? '');
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Configuracion"
          subtitle="Perfil del profesional y datos del sistema"
          icon={<Settings className="w-5 h-5" />}
        />

        {saved && (
          <ClinicalAlert level="info" title="Cambios guardados">
            Los datos del perfil se actualizaron correctamente.
          </ClinicalAlert>
        )}

        {/* Profile Section */}
        <SectionCard
          title="Perfil de Usuario"
          icon={<User className="w-4 h-4" />}
          actions={
            !editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary"
              >
                Editar perfil
              </button>
            ) : null
          }
        >
          {!editing ? (
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-clinical-600 text-white flex items-center justify-center text-xl font-bold uppercase">
                {user?.full_name?.charAt(0) ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <label className="label-clinical">Nombre</label>
                    <p className="text-slate-800 font-medium">{user?.full_name}</p>
                  </div>
                  <div>
                    <label className="label-clinical">Correo electronico</label>
                    <p className="text-slate-800 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="label-clinical">Rol</label>
                    <p className="text-slate-800 font-medium capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <label className="label-clinical">Numero de licencia</label>
                    <p className="text-slate-800 font-medium">{user?.license_number}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-clinical-600 text-white flex items-center justify-center text-xl font-bold uppercase">
                  {user?.full_name?.charAt(0) ?? 'U'}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <label className="label-clinical">Nombre</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-clinical"
                    />
                  </div>
                  <div>
                    <label className="label-clinical">Numero de licencia</label>
                    <input
                      type="text"
                      value={editLicense}
                      onChange={(e) => setEditLicense(e.target.value)}
                      className="input-clinical"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary">
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* System Info Section */}
        <SectionCard
          title="Informacion del Sistema"
          icon={<Server className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* System Name */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Server className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Sistema</p>
                <p className="text-slate-800 font-medium">HTA Cloud</p>
              </div>
            </div>

            {/* Supabase Cloud Status */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Cloud className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Supabase Cloud</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium text-emerald-600">Conectado</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Database className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Base de datos</p>
                <p className="text-slate-800 font-medium">PostgreSQL (Supabase Cloud)</p>
              </div>
            </div>

            {/* Authentication */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Shield className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Autenticacion</p>
                <p className="text-slate-800 font-medium">Supabase Auth</p>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Database className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Almacenamiento</p>
                <p className="text-slate-800 font-medium">Supabase Storage</p>
              </div>
            </div>

            {/* Version */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-clinical-50 rounded-lg">
                <Server className="w-4 h-4 text-clinical-600" />
              </div>
              <div>
                <p className="label-clinical">Version</p>
                <p className="text-slate-800 font-medium">1.0.0</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
