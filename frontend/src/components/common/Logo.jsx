import { Shield } from 'lucide-react';

export function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: { box: 'h-8 w-8', icon: 18, text: 'text-base' },
    md: { box: 'h-10 w-10', icon: 22, text: 'text-lg' },
    lg: { box: 'h-14 w-14', icon: 30, text: 'text-2xl' },
  };
  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${s.box} rounded-lg bg-civic-blue flex items-center justify-center flex-shrink-0`}>
        <Shield size={s.icon} className="text-white" fill="white" fillOpacity={0.15} />
      </div>
      {showText && (
        <span className={`font-bold ${s.text} text-civic-text-primary tracking-tight`}>
          Smart<span className="text-civic-blue">Civic</span>
        </span>
      )}
    </div>
  );
}
