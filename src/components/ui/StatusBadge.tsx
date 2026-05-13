import type { BPCategory } from '../../types';
import { BP_CATEGORY_LABELS } from '../../types';

const STATUS_CONFIG: Record<BPCategory, { bg: string; text: string; dot: string }> = {
  normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  elevated: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  hta_stage1: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  hta_stage2: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  hta_grave: { bg: 'bg-red-50', text: 'text-red-800', dot: 'bg-red-700' },
  hypertensive_crisis: { bg: 'bg-red-100', text: 'text-red-900', dot: 'bg-red-900' },
};

interface Props {
  category: BPCategory;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ category, showDot = true, size = 'sm' }: Props) {
  const config = STATUS_CONFIG[category];
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses} ${config.bg} ${config.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {BP_CATEGORY_LABELS[category]}
    </span>
  );
}
