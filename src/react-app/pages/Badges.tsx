import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import { Award, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import BadgeCard from '@/react-app/components/BadgeCard';

interface Badge {
  id: number;
  slug: string;
  titulo: string;
  descricao: string;
  cor: string;
  icone: string;
  data?: string;
  earned?: boolean;
}

export default function Badges() {
  const { user, isPending } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');

  useEffect(() => {
    if (!isPending && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      fetchBadges();
    }
  }, [user, isPending]);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges/me');
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
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

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  const filteredBadges = filter === 'earned' ? earnedBadges :
    filter === 'available' ? availableBadges : badges;

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
                <Award className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Suas Conquistas</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-accent/20">
            <div className="text-2xl font-bold text-accent">{earnedBadges.length}</div>
            <div className="text-sm text-secondary">Conquistadas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{availableBadges.length}</div>
            <div className="text-sm text-secondary">Disponíveis</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-complement">
              {badges.length > 0 ? Math.round((earnedBadges.length / badges.length) * 100) : 0}%
            </div>
            <div className="text-sm text-secondary">Progresso</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${filter === 'all'
                ? 'bg-accent text-primary font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <Award className="w-4 h-4" />
            <span>Todas</span>
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${filter === 'earned'
                ? 'bg-accent text-primary font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Conquistadas ({earnedBadges.length})</span>
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${filter === 'available'
                ? 'bg-accent text-primary font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <Lock className="w-4 h-4" />
            <span>Disponíveis ({availableBadges.length})</span>
          </button>
        </div>

        {/* Grid de Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="relative">
              <BadgeCard badge={badge} earned={badge.earned} />
              <div className="mt-3 text-center">
                <h3 className={`font-semibold text-sm ${badge.earned ? 'text-white' : 'text-white/60'}`}>
                  {badge.titulo}
                </h3>
                <p className={`text-xs mt-1 ${badge.earned ? 'text-secondary' : 'text-white/40'}`}>
                  {badge.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'earned' ? 'Nenhuma conquista ainda' :
                filter === 'available' ? 'Todas as conquistas desbloqueadas!' :
                  'Carregando conquistas...'}
            </h3>
            <p className="text-secondary">
              {filter === 'earned' ? 'Continue participando das atividades para desbloquear suas primeiras conquistas!' :
                filter === 'available' ? 'Parabéns! Você conquistou todas as conquistas disponíveis.' :
                  'Aguarde enquanto carregamos suas conquistas.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
