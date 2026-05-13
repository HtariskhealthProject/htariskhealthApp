import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Heart, Pill, ClipboardList } from 'lucide-react';

interface Props {
  title: string;
  color: string;
  actionLevel: string;
  followUp: string;
  lifestyle: string[];
  pharmacological: string[];
  monitoring: string[];
  defaultOpen?: boolean;
}

export default function RecommendationCard({
  title,
  color,
  actionLevel,
  followUp,
  lifestyle,
  pharmacological,
  monitoring,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card-clinical overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{actionLevel} &middot; {followUp}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          <RecSection icon={<Heart className="w-4 h-4" />} title="Estilo de Vida" items={lifestyle} />
          <RecSection icon={<Pill className="w-4 h-4" />} title="Farmacologico" items={pharmacological} />
          <RecSection icon={<ClipboardList className="w-4 h-4" />} title="Monitoreo" items={monitoring} />
        </div>
      )}
    </div>
  );
}

function RecSection({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-clinical-600">{icon}</span>
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
      </div>
      <ul className="space-y-1.5 ml-6">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
