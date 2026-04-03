interface Badge {
  id: number;
  slug: string;
  titulo: string;
  descricao: string;
  cor: string;
  icone: string;
  data?: string;
}

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BadgeCard({ badge, earned = false, size = 'md' }: BadgeCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-20 h-24', 
    lg: 'w-24 h-28'
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div 
        className={`
          w-full h-full rounded-2xl border-2 transition-all duration-300
          ${earned 
            ? 'border-white/30 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm shadow-lg' 
            : 'border-white/10 bg-white/5 grayscale opacity-50'
          }
        `}
        style={{ 
          backgroundColor: earned ? badge.cor + '15' : undefined,
          boxShadow: earned ? `0 0 20px ${badge.cor}25` : undefined
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-2">
          <div className={`${iconSizes[size]} mb-1`}>
            {badge.icone}
          </div>
          <div className="text-center">
            <p className={`font-semibold text-white leading-tight ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {badge.titulo}
            </p>
            {badge.data && earned && (
              <p className="text-xs text-secondary mt-1">
                {new Date(badge.data).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {earned && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <span className="text-xs text-primary">✓</span>
        </div>
      )}
    </div>
  );
}
