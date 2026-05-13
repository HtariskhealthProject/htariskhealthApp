import type { ReactNode } from 'react';
import { AlertTriangle, Info, AlertOctagon, XCircle } from 'lucide-react';

interface Props {
  level: 'info' | 'warning' | 'danger' | 'critical';
  title?: string;
  children: ReactNode;
}

const config = {
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    icon: Info,
    iconColor: 'text-sky-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  danger: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: AlertOctagon,
    iconColor: 'text-orange-500',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
};

export default function AlertBanner({ level, title, children }: Props) {
  const c = config[level];
  const Icon = c.icon;

  return (
    <div className={`rounded-lg border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.iconColor}`} />
        <div>
          {title && <p className={`font-semibold text-sm ${c.text}`}>{title}</p>}
          <div className={`text-sm ${c.text} ${title ? 'mt-1' : ''}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
