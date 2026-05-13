import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Shield, HeartPulse, Bell, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, label: 'Clasificacion AHA 2025' },
    { icon: HeartPulse, label: 'Seguimiento Continuo' },
    { icon: Bell, label: 'Alertas Clinicas' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branded panel */}
      <div className="bg-gradient-to-br from-clinical-700 to-clinical-900 flex-shrink-0 lg:w-1/2 flex flex-col justify-between px-8 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-12">
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-clinical-600 mb-8">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">HTA Cloud</h1>
          <p className="text-clinical-200 text-lg font-medium mb-6">CardioPressure Cloud</p>
          <p className="text-clinical-300 text-sm leading-relaxed max-w-md">
            Plataforma cloud para la clasificacion y seguimiento del riesgo de hipertension arterial
          </p>

          <div className="mt-10 space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-clinical-600/30 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-clinical-200" />
                </div>
                <span className="text-white text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-clinical-800/50 border border-clinical-600/30">
            <Shield className="w-3.5 h-3.5 text-clinical-300" />
            <span className="text-clinical-200 text-xs font-medium">
              Acceso exclusivo para personal sanitario
            </span>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Iniciar Sesion</h2>
          <p className="text-slate-500 text-sm mb-8">Introduzca sus credenciales para acceder</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-clinical">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-clinical"
                placeholder="dr.martinez@hta-risk.com"
                required
              />
            </div>

            <div>
              <label className="label-clinical">Contrasena</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-clinical pr-10"
                  placeholder="demo123"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              No tiene cuenta?{' '}
              <Link to="/register" className="text-clinical-600 font-medium hover:underline">
                Registrese
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500">
            <p className="font-medium text-slate-600 mb-1.5">Credenciales de prueba:</p>
            <p>Medico: dr.martinez@hta-risk.com / demo123</p>
            <p>Enfermera: enfermera.garcia@hta-risk.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
