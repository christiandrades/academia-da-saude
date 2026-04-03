import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  User,
  LogOut,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Zap,
  Settings
} from 'lucide-react';
import { Link } from 'react-router';
import PresenceChart from '@/react-app/components/PresenceChart';
import ClassificationBadge from '@/react-app/components/ClassificationBadge';

export default function Dashboard() {
  const { user, logout, isPending } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChallenges, setActiveChallenges] = useState(0);
  const [userBadges, setUserBadges] = useState(0);
  const [showRoleChanger, setShowRoleChanger] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, isPending]);

  const fetchUserProfile = async () => {
    try {
      const [profileRes, challengesRes, badgesRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/challenges/me'),
        fetch('/api/badges/me')
      ]);

      const profile = await profileRes.json();
      const challenges = await challengesRes.json();
      const badges = await badgesRes.json();

      setUserProfile(profile);
      setActiveChallenges(challenges.filter((c: any) => !c.is_concluido).length);
      setUserBadges(badges.filter((b: any) => b.earned).length);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      const endpoint = newRole === 'admin' ? '/api/users/promote-to-admin' :
        newRole === 'instructor' ? '/api/users/promote-to-instructor' :
          '/api/users/demote-to-student';

      const response = await fetch(endpoint, { method: 'POST' });

      if (response.ok) {
        alert(`Role alterado para ${newRole}! Recarregando página...`);
        window.location.reload();
      } else {
        alert('Erro ao alterar role');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar role');
    }
    setShowRoleChanger(false);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const presencaAtual = 85; // Simulado - será calculado dinamicamente
  const metaMensal = 80;
  const posicaoRanking = 3; // Simulado

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-support">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm border-b border-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Olá, {userProfile.nome}! 👋
                </h1>
                <p className="text-secondary text-sm">
                  Que bom te ver por aqui
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botão temporário para testar roles */}
              <button
                onClick={() => setShowRoleChanger(true)}
                className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
              >
                Testar Role
              </button>

              {userProfile && (userProfile.role === 'admin' || userProfile.role === 'instructor') && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-secondary hover:text-accent transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-secondary hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Cartão Principal - Frequência */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-accent/20">
          <div className="text-center">
            <div className="mb-6">
              <PresenceChart percentage={presencaAtual} />
            </div>

            <div className="mb-4">
              <ClassificationBadge percentage={presencaAtual} />
            </div>

            <p className="text-secondary text-lg">
              Meta mensal: {metaMensal}% • Faltam {Math.max(0, metaMensal - presencaAtual)}% para a meta
            </p>
          </div>
        </div>

        {/* Cards de navegação rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/ranking" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ranking</h3>
                  <p className="text-secondary text-sm">Ver posições</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-accent transition-colors md:hidden" />
            </div>
          </Link>

          <Link to="/badges" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-complement/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-complement" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Conquistas</h3>
                  <p className="text-secondary text-sm">Suas badges</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-complement transition-colors md:hidden" />
            </div>
          </Link>

          <Link to="/challenges" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Desafios</h3>
                  <p className="text-secondary text-sm">{activeChallenges} ativos</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-secondary transition-colors md:hidden" />
            </div>
          </Link>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-support/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-support" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Energia</h3>
                <p className="text-secondary text-sm">100% ativa!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Posição</h3>
                <p className="text-2xl font-bold text-accent">#{posicaoRanking}</p>
              </div>
            </div>
            <p className="text-secondary text-sm">no ranking geral</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-complement/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-complement" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sequência</h3>
                <p className="text-2xl font-bold text-complement">5 dias</p>
              </div>
            </div>
            <p className="text-secondary text-sm">sem faltar - continue assim!</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Conquistas</h3>
                <p className="text-2xl font-bold text-secondary">{userBadges}</p>
              </div>
            </div>
            <p className="text-secondary text-sm">badges desbloqueadas</p>
          </div>
        </div>

        {/* Próximas Aulas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-accent/20">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-semibold text-white">Próximas Aulas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Hoje - 14:00h</p>
                <p className="text-secondary text-sm">GAF 01 • Alongamento e Fortalecimento</p>
              </div>
              <div className="w-2 h-2 bg-accent rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Amanhã - 14:00h</p>
                <p className="text-secondary text-sm">GAF 01 • Caminhada em Grupo</p>
              </div>
              <div className="w-2 h-2 bg-complement rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mensagem Motivacional */}
        <div className="bg-gradient-to-r from-accent/20 to-complement/20 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">💪 Mensagem do dia</h3>
              <p className="text-secondary leading-relaxed">
                Você está indo muito bem! Sua dedicação nas últimas semanas mostra que está comprometido(a)
                com sua saúde. Continue assim e logo alcançará o selo verde!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para alteração de role (apenas para testes) */}
      {showRoleChanger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Testar Interface (Desenvolvimento)</h3>
            <p className="text-secondary text-sm mb-6">
              Role atual: <span className="text-accent font-semibold">{userProfile?.role}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleRoleChange('student')}
                className="w-full bg-blue-500/20 text-blue-300 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors text-left"
              >
                <div className="font-semibold">Aluno</div>
                <div className="text-sm opacity-70">Dashboard com gamificação</div>
              </button>
              <button
                onClick={() => handleRoleChange('instructor')}
                className="w-full bg-green-500/20 text-green-300 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors text-left"
              >
                <div className="font-semibold">Instrutor</div>
                <div className="text-sm opacity-70">Gestão de turmas e frequência</div>
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                className="w-full bg-red-500/20 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors text-left"
              >
                <div className="font-semibold">Administrador</div>
                <div className="text-sm opacity-70">Acesso completo ao sistema</div>
              </button>
            </div>
            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowRoleChanger(false)}
                className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
