import type { Patient, BPCategory } from '../../types';
import { formatDate, SEX_LABELS } from '../../utils/formatters';
import StatusBadge from './StatusBadge';
import { User, Calendar, MapPin } from 'lucide-react';

interface Props {
  patient: Patient;
  latestCategory?: BPCategory;
  latestBP?: string;
  onClick?: () => void;
}

export default function PatientSummaryCard({ patient, latestCategory, latestBP, onClick }: Props) {
  const age = Math.floor(
    (Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div
      onClick={onClick}
      className={`card-clinical-hover p-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-clinical-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-clinical-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {patient.first_name} {patient.last_name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{SEX_LABELS[patient.sex]}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{age} anos</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {patient.city}
              </span>
            </div>
          </div>
        </div>
        {latestCategory && <StatusBadge category={latestCategory} size="sm" />}
      </div>

      {latestBP && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Ultima PA</span>
          <span className="text-sm font-bold text-slate-800 font-mono">{latestBP}</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar className="w-3 h-3" />
        <span>Registro: {formatDate(patient.created_at)}</span>
      </div>
    </div>
  );
}
