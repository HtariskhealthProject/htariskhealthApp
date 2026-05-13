import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function FilterBar({ children, className = '' }: Props) {
  return (
    <div className={`card-clinical p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtros</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

function FilterItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label-clinical text-xs">{label}</label>
      {children}
    </div>
  );
}

FilterBar.Item = FilterItem;
