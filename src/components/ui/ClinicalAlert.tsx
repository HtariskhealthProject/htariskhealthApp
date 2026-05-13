import type { ReactNode } from 'react';
import { AlertTriangle, Info, AlertOctagon, ShieldAlert } from 'lucide-react';

interface Props {
  level: 'info' | 'warning' | 'danger' | 'critical';
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const config = {
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    Icon: Info,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    Icon: AlertOctagon,
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: ShieldAlert,
  },
};

export default function ClinicalAlert({ level, title, children, icon, className = '' }: Props) {
  const c = config[level];
  const Icon = icon ? undefined : c.Icon;

  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${c.iconBg}`}>
          {icon ? (
            <span className={c.iconColor}>{icon}</span>
          ) : Icon ? (
            <Icon className={`w-4 h-4 ${c.iconColor}`} />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          {title && <p className={`font-semibold text-sm ${c.text}`}>{title}</p>}
          <div className={`text-sm ${c.text} ${title ? 'mt-1' : ''}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
