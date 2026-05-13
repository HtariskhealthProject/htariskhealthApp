import type { BPCategory } from '../../types';
import { classifyBloodPressure } from '../../utils/classification';

interface Props {
  category: BPCategory;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const config = classifyBloodPressure(
    category === 'normal' ? 110 :
    category === 'elevated' ? 125 :
    category === 'hta_stage1' ? 135 :
    category === 'hta_stage2' ? 150 :
    category === 'hta_grave' ? 185 :
    190,
    category === 'normal' ? 70 :
    category === 'elevated' ? 75 :
    category === 'hta_stage1' ? 85 :
    category === 'hta_stage2' ? 95 :
    category === 'hta_grave' ? 110 :
    125
  );

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {config.label}
    </span>
  );
}
