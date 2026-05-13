import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'clinical' | 'amber' | 'orange' | 'red' | 'emerald' | 'slate';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

const colorMap = {
  clinical: {
    bg: 'bg-clinical-50',
    iconBg: 'bg-clinical-100',
    iconText: 'text-clinical-700',
    value: 'text-clinical-900',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    value: 'text-amber-900',
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-700',
    value: 'text-orange-900',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-700',
    value: 'text-red-900',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    value: 'text-emerald-900',
  },
  slate: {
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    value: 'text-slate-900',
  },
};

export default function StatCard({ title, value, icon, color = 'clinical', subtitle, trend }: Props) {
  const c = colorMap[color];

  return (
    <div className={`rounded-xl p-5 ${c.bg} border border-transparent`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold mt-1.5 ${c.value}`}>{value}</p>
          {subtitle && <p className="text-xs mt-1 text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
          <span className={c.iconText}>{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend === 'up' && <span className="text-red-600">Tendencia al alza</span>}
          {trend === 'down' && <span className="text-emerald-600">Tendencia a la baja</span>}
          {trend === 'stable' && <span className="text-slate-500">Estable</span>}
        </div>
      )}
    </div>
  );
}
