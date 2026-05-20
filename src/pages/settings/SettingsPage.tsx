import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Save, X } from 'lucide-react';
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
          subtitle="Perfil del profesional"
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

      </div>
    </div>
  );
}
