import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import { Link } from 'react-router';
import RankingCard from '@/react-app/components/RankingCard';

interface RankingUser {
  id: number;
  nome: string;
  foto_url?: string;
  frequencia_percentual: number;
  posicao: number;
  badges_count: number;
}

export default function Ranking() {
  const { user, isPending } = useAuth();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'geral' | 'turma'>('geral');
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!isPending && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      fetchRanking();
    }
  }, [user, isPending, filter]);

  const fetchRanking = async () => {
    try {
      const [rankingRes, profileRes] = await Promise.all([
        fetch(`/api/ranking?filter=${filter}`),
        fetch('/api/users/me')
      ]);

      const rankingData = await rankingRes.json();
      const profile = await profileRes.json();

      setRanking(rankingData.ranking);
      setCurrentUserPosition(rankingData.currentUserPosition);
      setUserProfile(profile);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-support">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm border-b border-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-white hover:text-accent transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Ranking</h1>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('geral')}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'geral'
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                Geral
              </button>
              <button
                onClick={() => setFilter('turma')}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'turma'
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                Minha Turma
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Pódio - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">🏆 Pódio do Mês</h2>
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* 2º lugar */}
              {topThree[1] && (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 mx-auto mb-3 border-4 border-gray-300">
                    {topThree[1].foto_url ? (
                      <img src={topThree[1].foto_url} alt={topThree[1].nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {topThree[1].nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-4xl mb-2">🥈</p>
                    <p className="font-semibold text-white">{topThree[1].nome}</p>
                    <p className="text-gray-300 font-bold">{topThree[1].frequencia_percentual}%</p>
                  </div>
                </div>
              )}

              {/* 1º lugar */}
              {topThree[0] && (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 mx-auto mb-3 border-4 border-yellow-400">
                    {topThree[0].foto_url ? (
                      <img src={topThree[0].foto_url} alt={topThree[0].nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                        {topThree[0].nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-yellow-400/20 to-accent/20 backdrop-blur-sm rounded-xl p-4 border border-accent/40">
                    <p className="text-5xl mb-2">🥇</p>
                    <p className="font-bold text-accent">{topThree[0].nome}</p>
                    <p className="text-accent font-bold text-lg">{topThree[0].frequencia_percentual}%</p>
                  </div>
                </div>
              )}

              {/* 3º lugar */}
              {topThree[2] && (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 mx-auto mb-3 border-4 border-amber-600">
                    {topThree[2].foto_url ? (
                      <img src={topThree[2].foto_url} alt={topThree[2].nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {topThree[2].nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-4xl mb-2">🥉</p>
                    <p className="font-semibold text-white">{topThree[2].nome}</p>
                    <p className="text-amber-600 font-bold">{topThree[2].frequencia_percentual}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sua Posição */}
        {currentUserPosition && currentUserPosition > 3 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Medal className="w-5 h-5 mr-2 text-accent" />
              Sua Posição
            </h3>
            <RankingCard
              user={ranking.find(u => u.id === userProfile?.id) || ranking[currentUserPosition - 1]}
              isCurrentUser={true}
            />
          </div>
        )}

        {/* Restante do Ranking */}
        {others.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Demais Posições</h3>
            <div className="space-y-3">
              {others.map((rankingUser) => (
                <RankingCard
                  key={rankingUser.id}
                  user={rankingUser}
                  isCurrentUser={rankingUser.id === userProfile?.id}
                />
              ))}
            </div>
          </div>
        )}

        {ranking.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ranking em construção</h3>
            <p className="text-secondary">
              O ranking será atualizado conforme as atividades são registradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
