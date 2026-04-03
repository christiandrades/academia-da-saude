import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import { Target, ArrowLeft, Clock, CheckCircle, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router';

interface Challenge {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  meta_valor: number;
  meta_periodo: string;
  progresso_atual: number;
  is_concluido: boolean;
  data_fim: string;
}

export default function Challenges() {
  const { user, isPending } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      fetchChallenges();
    }
  }, [user, isPending]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/me');
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
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

  const activeWeeklyChallenges = challenges.filter(c => c.meta_periodo === 'SEMANAL' && !c.is_concluido);
  const activeMonthlyChallenges = challenges.filter(c => c.meta_periodo === 'MENSAL' && !c.is_concluido);
  const completedChallenges = challenges.filter(c => c.is_concluido);

  const getChallengeIcon = (tipo: string) => {
    switch (tipo) {
      case 'SEQUENCIA': return <Flame className="w-6 h-6" />;
      case 'FREQUENCIA': return <Target className="w-6 h-6" />;
      default: return <Trophy className="w-6 h-6" />;
    }
  };

  const getChallengeColor = (tipo: string) => {
    switch (tipo) {
      case 'SEQUENCIA': return 'from-red-500/20 to-orange-500/20 border-red-400/40';
      case 'FREQUENCIA': return 'from-accent/20 to-complement/20 border-accent/40';
      default: return 'from-secondary/20 to-complement/20 border-secondary/40';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (dataFim: string) => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const progress = getProgressPercentage(challenge.progresso_atual, challenge.meta_valor);
    const daysRemaining = getDaysRemaining(challenge.data_fim);

    return (
      <div className={`bg-gradient-to-br ${getChallengeColor(challenge.tipo)} backdrop-blur-sm rounded-2xl p-6 border relative overflow-hidden`}>
        {challenge.is_concluido && (
          <div className="absolute top-4 right-4">
            <CheckCircle className="w-6 h-6 text-accent" />
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.tipo === 'SEQUENCIA' ? 'bg-red-500/20 text-red-400' : challenge.tipo === 'FREQUENCIA' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'}`}>
            {getChallengeIcon(challenge.tipo)}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-2">{challenge.titulo}</h3>
            <p className="text-secondary text-sm mb-4">{challenge.descricao}</p>

            <div className="space-y-3">
              {/* Barra de progresso */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">
                    {challenge.progresso_atual} / {challenge.meta_valor}
                  </span>
                  <span className="text-accent font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-accent to-complement h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Tempo restante */}
              {!challenge.is_concluido && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-secondary">
                    {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Último dia!'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-support">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm border-b border-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-white hover:text-accent transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-accent" />
              <h1 className="text-xl font-bold text-white">Desafios</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Desafios Semanais */}
        {activeWeeklyChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Flame className="w-6 h-6 mr-2 text-red-400" />
              Desafios da Semana
            </h2>
            <div className="space-y-4">
              {activeWeeklyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}

        {/* Desafios Mensais */}
        {activeMonthlyChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2 text-accent" />
              Desafios do Mês
            </h2>
            <div className="space-y-4">
              {activeMonthlyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}

        {/* Desafios Concluídos */}
        {completedChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-complement" />
              Concluídos ({completedChallenges.length})
            </h2>
            <div className="space-y-4">
              {completedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}

        {challenges.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum desafio disponível</h3>
            <p className="text-secondary">
              Novos desafios serão criados em breve. Continue participando das atividades!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
