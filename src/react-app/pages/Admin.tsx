import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  Settings,
  Users,
  Calendar,
  BarChart3,
  Download,
  FileText,
  Eye,
  Edit,
  Plus,
  Upload,
  Target
} from 'lucide-react';
import { Link } from 'react-router';

interface AdminStats {
  totalAlunos: number;
  totalTurmas: number;
  totalAulas: number;
  frequenciaGeral: number;
  alunosAtivos: number;
}

export default function Admin() {
  const { user, isPending } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('/api/users/me');
      const profile = await response.json();

      // Verificar se é admin
      if (profile.role !== 'admin' && profile.role !== 'instructor') {
        window.location.href = '/dashboard';
        return;
      }

      setUserProfile(profile);
      fetchAdminStats();
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      window.location.href = '/dashboard';
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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

  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'instructor')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-secondary mb-4">Você não tem permissão para acessar esta área.</p>
          <Link to="/dashboard" className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-support">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm border-b border-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-secondary text-sm">
                  {userProfile.role === 'admin' ? 'Administrador' : 'Instrutor'} - {userProfile.nome}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="text-secondary hover:text-white transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalAlunos}</p>
                  <p className="text-secondary text-sm">Alunos</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-complement" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalTurmas}</p>
                  <p className="text-secondary text-sm">Turmas</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalAulas}</p>
                  <p className="text-secondary text-sm">Aulas</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-support" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.frequenciaGeral}%</p>
                  <p className="text-secondary text-sm">Frequência</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.alunosAtivos}</p>
                  <p className="text-secondary text-sm">Ativos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu de Ações */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestão de Turmas */}
          <Link to="/admin/turmas" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white">Turmas</h3>
            </div>
            <p className="text-secondary mb-4">Gerenciar turmas, horários e instrutores</p>
            <div className="flex items-center space-x-2 text-accent">
              <span>Gerenciar</span>
              <Edit className="w-4 h-4" />
            </div>
          </Link>

          {/* Gestão de Aulas */}
          <Link to="/admin/aulas" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-complement/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-complement" />
              </div>
              <h3 className="text-xl font-semibold text-white">Aulas</h3>
            </div>
            <p className="text-secondary mb-4">Criar e gerenciar aulas das turmas</p>
            <div className="flex items-center space-x-2 text-complement">
              <span>Gerenciar</span>
              <Plus className="w-4 h-4" />
            </div>
          </Link>

          {/* Gestão de Frequência */}
          <Link to="/admin/frequencia" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-white">Frequência</h3>
            </div>
            <p className="text-secondary mb-4">Registrar presença e integrar Google Forms</p>
            <div className="flex items-center space-x-2 text-secondary">
              <span>Registrar</span>
              <Upload className="w-4 h-4" />
            </div>
          </Link>

          {/* Relatórios */}
          <Link to="/admin/relatorios" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-support/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-support" />
              </div>
              <h3 className="text-xl font-semibold text-white">Relatórios</h3>
            </div>
            <p className="text-secondary mb-4">Analytics e insights com IA</p>
            <div className="flex items-center space-x-2 text-support">
              <span>Visualizar</span>
              <Eye className="w-4 h-4" />
            </div>
          </Link>

          {/* Gestão de Desafios */}
          <Link to="/admin/desafios" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white">Desafios</h3>
            </div>
            <p className="text-secondary mb-4">Criar e gerenciar desafios gamificados</p>
            <div className="flex items-center space-x-2 text-accent">
              <span>Gerenciar</span>
              <Target className="w-4 h-4" />
            </div>
          </Link>

          {/* Gestão de Usuários */}
          <Link to="/admin/usuarios" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:bg-white/15 transition-all group">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white">Usuários</h3>
            </div>
            <p className="text-secondary mb-4">Gerenciar perfis e permissões</p>
            <div className="flex items-center space-x-2 text-accent">
              <span>Gerenciar</span>
              <Settings className="w-4 h-4" />
            </div>
          </Link>

          {/* Exportar Dados */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-complement/20 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-complement" />
              </div>
              <h3 className="text-xl font-semibold text-white">Exportar</h3>
            </div>
            <p className="text-secondary mb-4">Baixar relatórios e dados</p>
            <button className="flex items-center space-x-2 text-complement hover:text-white transition-colors">
              <span>Download</span>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
          <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
              Nova Aula
            </button>
            <button className="bg-complement text-primary px-4 py-2 rounded-lg font-semibold hover:bg-complement/90 transition-colors">
              Registrar Frequência
            </button>
            <button className="bg-secondary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
              Gerar Relatório
            </button>
            <button className="bg-support text-white px-4 py-2 rounded-lg font-semibold hover:bg-support/90 transition-colors">
              Insights IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
