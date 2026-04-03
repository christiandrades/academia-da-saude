import { useMemo } from 'react';

interface PresenceChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function PresenceChart({ percentage, size = 128, strokeWidth = 8 }: PresenceChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color = useMemo(() => {
    if (percentage >= 95) return '#B1E001'; // accent - verde limão
    if (percentage >= 75) return '#CEF09D'; // complement - complementar suave
    if (percentage >= 50) return '#FCD34D'; // amarelo
    if (percentage >= 30) return '#F87171'; // vermelho claro
    return '#EF4444'; // vermelho
  }, [percentage]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{percentage}%</div>
          <div className="text-sm text-secondary">presença</div>
        </div>
      </div>
    </div>
  );
}
