import type { BloodPressureReading } from '../../types';
import { formatDateTime, formatBP, CONTEXT_LABELS } from '../../utils/formatters';
import { ALARM_SYMPTOMS } from '../../types';
import StatusBadge from './StatusBadge';
import { Activity, AlertTriangle } from 'lucide-react';

interface Props {
  readings: BloodPressureReading[];
  maxItems?: number;
}

export default function RecordTimeline({ readings, maxItems = 10 }: Props) {
  const display = readings.slice(0, maxItems);

  if (display.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-slate-200" />
      <div className="space-y-4">
        {display.map((reading) => {
          const hasAlarm = reading.alarm_symptoms.length > 0;
          return (
            <div key={reading.id} className="relative flex gap-4">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                hasAlarm ? 'bg-red-100 text-red-600' : 'bg-clinical-50 text-clinical-600'
              }`}>
                {hasAlarm ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0 card-clinical p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                      {formatBP(reading.systolic, reading.diastolic)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      FC: {reading.heart_rate} lpm &middot; PAM: {reading.mean_arterial_pressure}
                    </p>
                  </div>
                  <StatusBadge category={reading.category} size="sm" />
                </div>
                {hasAlarm && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {reading.alarm_symptoms.map((s) => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                        {ALARM_SYMPTOMS[s]}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1.5">
                  {formatDateTime(reading.created_at)} &middot; {CONTEXT_LABELS[reading.reading_context]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
