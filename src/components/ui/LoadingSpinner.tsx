interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export default function LoadingSpinner({ size = 'md' }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeMap[size]} border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin`}
      />
    </div>
  );
}
