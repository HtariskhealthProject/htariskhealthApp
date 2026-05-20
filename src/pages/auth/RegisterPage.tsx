import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'medico' as 'medico' | 'enfermera',
    license_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branded panel */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0 lg:w-1/2 flex flex-col justify-between px-8 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-12">
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-8">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">HTA Cloud</h1>
          <p className="text-blue-100 text-lg font-medium mb-6">CardioPressure Cloud</p>
          <p className="text-blue-100/90 text-sm leading-relaxed max-w-md">
            Plataforma cloud para la clasificacion y seguimiento del riesgo de hipertension arterial
          </p>
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/15 border border-white/20">
            <Activity className="w-3.5 h-3.5 text-blue-100/90" />
            <span className="text-blue-100 text-xs font-medium">
              Acceso exclusivo para personal sanitario
            </span>
          </div>
        </div>
      </div>

      {/* Right registration form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Crear Cuenta</h2>
          <p className="text-slate-500 text-sm mb-8">Registro de profesional de salud</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-clinical">Nombre completo</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input-clinical"
                required
              />
            </div>

            <div>
              <label className="label-clinical">Correo</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-clinical"
                required
              />
            </div>

            <div>
              <label className="label-clinical">Contrasena</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-clinical pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label-clinical">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'medico' | 'enfermera' })}
                className="select-clinical"
              >
                <option value="medico">Medico</option>
                <option value="enfermera">Enfermera</option>
              </select>
            </div>

            <div>
              <label className="label-clinical">Numero de licencia</label>
              <input
                type="text"
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                className="input-clinical"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Ya tiene cuenta?{' '}
              <Link to="/login" className="text-clinical-600 font-medium hover:underline">
                Inicie sesion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
