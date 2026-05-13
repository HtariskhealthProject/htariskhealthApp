import type { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export default function TrendChartCard({ title, subtitle, children, className = '', icon }: Props) {
  return (
    <div className={`card-clinical ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <span className="text-clinical-600">{icon ?? <TrendingUp className="w-4 h-4" />}</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
