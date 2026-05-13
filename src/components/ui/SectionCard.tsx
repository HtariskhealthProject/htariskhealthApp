import type { ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionCard({ title, subtitle, icon, children, actions, className = '', noPadding }: Props) {
  return (
    <div className={`card-clinical ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-clinical-600">{icon}</span>}
            <div>
              {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}
