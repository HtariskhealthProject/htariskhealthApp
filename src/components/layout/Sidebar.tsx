import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  History,
  FileBarChart,
  Lightbulb,
  Settings,
  LogOut,
  X,
  Activity
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Pacientes', icon: Users },
  { to: '/readings/new', label: 'Nueva Lectura', icon: HeartPulse },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/reports', label: 'Reportes', icon: FileBarChart },
  { to: '/recommendations', label: 'Recomendaciones', icon: Lightbulb },
  { to: '/settings', label: 'Configuracion', icon: Settings },
];

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-[#F8FBFF] border-r border-clinical-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clinical-500 to-clinical-700 shadow-md flex items-center justify-center">
  <Activity className="w-5 h-5 text-white" />
</div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clinical-500 to-clinical-700 shadow-md flex items-center justify-center">
  <Activity className="w-5 h-5 text-white" />
</div>

<div>
  <h1 className="text-lg font-bold text-clinical-800 tracking-tight">
    HTA Cloud
  </h1>

  <p className="text-[11px] text-clinical-400 font-semibold tracking-wide uppercase">
    CardioPressure Monitor
  </p>
</div>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Menu Principal
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-clinical-50 text-clinical-700 shadow-sm border border-clinical-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        {user && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-clinical-100 flex items-center justify-center">
                <span className="text-sm font-bold text-clinical-700">
                  {user.full_name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{user.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user.role === 'medico' ? 'Medico' : 'Enfermera'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesion
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
