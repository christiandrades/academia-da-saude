interface BadgeIconProps {
  badge: {
    icone: string;
    titulo: string;
    cor: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function BadgeIcon({ badge, size = 'md' }: BadgeIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 border-white/20 backdrop-blur-sm`}
      style={{ backgroundColor: badge.cor + '20' }}
      title={badge.titulo}
    >
      <span className="filter drop-shadow-sm">
        {badge.icone}
      </span>
    </div>
  );
}
