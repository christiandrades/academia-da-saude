interface RankingUser {
  id: number;
  nome: string;
  foto_url?: string;
  frequencia_percentual: number;
  posicao: number;
  badges_count: number;
}

interface RankingCardProps {
  user: RankingUser;
  isCurrentUser?: boolean;
}

export default function RankingCard({ user, isCurrentUser = false }: RankingCardProps) {
  const getTrophyIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈'; 
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getTrophyColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-white';
    }
  };

  const getFrequencyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-accent';
    if (percentage >= 75) return 'text-complement';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-200
      ${isCurrentUser 
        ? 'bg-accent/10 border-accent/40 ring-2 ring-accent/30' 
        : 'bg-white/5 border-white/10 hover:bg-white/10'
      }
    `}>
      <div className="flex items-center space-x-4">
        {/* Posição */}
        <div className={`text-2xl font-bold ${getTrophyColor(user.posicao)} min-w-[3rem] text-center`}>
          {getTrophyIcon(user.posicao)}
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {user.foto_url ? (
            <img 
              src={user.foto_url} 
              alt={user.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
              {user.nome.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isCurrentUser ? 'text-accent' : 'text-white'}`}>
              {user.nome}
              {isCurrentUser && <span className="ml-2 text-xs text-secondary">(você)</span>}
            </h3>
            <div className="text-right">
              <div className={`text-lg font-bold ${getFrequencyColor(user.frequencia_percentual)}`}>
                {user.frequencia_percentual}%
              </div>
              <div className="text-xs text-secondary">
                {user.badges_count} {user.badges_count === 1 ? 'badge' : 'badges'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
