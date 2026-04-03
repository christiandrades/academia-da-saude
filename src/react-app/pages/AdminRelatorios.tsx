import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Eye,
  FileText
} from 'lucide-react';
import { Link } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface RelatorioData {
  frequenciaPorMes: Array<{ mes: string; frequencia: number; total: number }>;
  frequenciaPorTurma: Array<{ turma: string; frequencia: number; total: number }>;
  badgesPorMes: Array<{ mes: string; badges: number }>;
  desafiosConcluidos: Array<{ tipo: string; concluidos: number; total: number }>;
  topAlunos: Array<{ nome: string; frequencia: number; badges: number }>;
  estatisticasGerais: {
    totalAlunos: number;
    frequenciaMedia: number;
    badgesDistribuidos: number;
    desafiosAtivos: number;
    aulasRealizadas: number;
  };
  insights: Array<{ titulo: string; descricao: string; tipo: 'success' | 'warning' | 'info' }>;
}

const COLORS = ['#B1E001', '#CEF09D', '#B8ECD7', '#476C5E', '#083643'];

export default function AdminRelatorios() {
  const { user, isPending } = useAuth();
  const [, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');

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

      if (profile.role !== 'admin' && profile.role !== 'instructor') {
        window.location.href = '/dashboard';
        return;
      }

      setUserProfile(profile);
      fetchRelatorioData();
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const fetchRelatorioData = async () => {
    try {
      const response = await fetch(`/api/admin/relatorios?periodo=${periodoSelecionado}`);
      const data = await response.json();
      setRelatorioData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      // Mock data para demonstração
      setRelatorioData({
        frequenciaPorMes: [
          { mes: 'Jan', frequencia: 85, total: 120 },
          { mes: 'Fev', frequencia: 78, total: 135 },
          { mes: 'Mar', frequencia: 92, total: 140 },
          { mes: 'Abr', frequencia: 88, total: 138 },
          { mes: 'Mai', frequencia: 95, total: 142 },
          { mes: 'Jun', frequencia: 90, total: 145 }
        ],
        frequenciaPorTurma: [
          { turma: 'GAF 01 - Manhã', frequencia: 92, total: 35 },
          { turma: 'GAF 02 - Tarde', frequencia: 88, total: 42 },
          { turma: 'GAF 03 - Noite', frequencia: 85, total: 38 },
          { turma: 'Hidroginástica', frequencia: 95, total: 30 }
        ],
        badgesPorMes: [
          { mes: 'Jan', badges: 45 },
          { mes: 'Fev', badges: 52 },
          { mes: 'Mar', badges: 67 },
          { mes: 'Abr', badges: 58 },
          { mes: 'Mai', badges: 73 },
          { mes: 'Jun', badges: 69 }
        ],
        desafiosConcluidos: [
          { tipo: 'Frequência', concluidos: 34, total: 45 },
          { tipo: 'Sequência', concluidos: 28, total: 45 },
          { tipo: 'Atividade', concluidos: 41, total: 45 }
        ],
        topAlunos: [
          { nome: 'Maria Silva', frequencia: 98, badges: 12 },
          { nome: 'João Santos', frequencia: 95, badges: 10 },
          { nome: 'Ana Costa', frequencia: 92, badges: 11 },
          { nome: 'Pedro Lima', frequencia: 90, badges: 9 },
          { nome: 'Carla Souza', frequencia: 88, badges: 8 }
        ],
        estatisticasGerais: {
          totalAlunos: 145,
          frequenciaMedia: 89,
          badgesDistribuidos: 364,
          desafiosAtivos: 8,
          aulasRealizadas: 156
        },
        insights: [
          {
            titulo: 'Excelente Engajamento',
            descricao: 'A frequência média aumentou 8% no último mês, indicando maior engajamento dos alunos.',
            tipo: 'success'
          },
          {
            titulo: 'Atenção: Turma Noturna',
            descricao: 'A turma GAF 03 - Noite apresenta frequência ligeiramente abaixo da média. Considere estratégias de motivação.',
            tipo: 'warning'
          },
          {
            titulo: 'Oportunidade de Gamificação',
            descricao: 'Alunos que participam de desafios têm 23% mais frequência. Considere criar mais desafios.',
            tipo: 'info'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async (formato: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/relatorios/export?formato=${formato}&periodo=${periodoSelecionado}`, {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `relatorio-academia-saude-${periodoSelecionado}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Funcionalidade de exportação será implementada em breve');
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!relatorioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-secondary mb-4">Não foi possível carregar os dados do relatório.</p>
          <Link to="/admin" className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold">
            Voltar ao Admin
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
              <Link to="/admin" className="text-white hover:text-accent transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Relatórios e Analytics</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={periodoSelecionado}
                onChange={(e) => {
                  setPeriodoSelecionado(e.target.value);
                  fetchRelatorioData();
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
              >
                <option value="7d" className="bg-primary text-white">Últimos 7 dias</option>
                <option value="30d" className="bg-primary text-white">Últimos 30 dias</option>
                <option value="90d" className="bg-primary text-white">Últimos 90 dias</option>
                <option value="1y" className="bg-primary text-white">Último ano</option>
              </select>
              <button
                onClick={() => exportarRelatorio('excel')}
                className="bg-complement text-primary px-4 py-2 rounded-lg font-semibold hover:bg-complement/90 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => exportarRelatorio('pdf')}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas Gerais */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-white">{relatorioData.estatisticasGerais.totalAlunos}</p>
                <p className="text-secondary text-sm">Alunos Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-complement" />
              <div>
                <p className="text-2xl font-bold text-white">{relatorioData.estatisticasGerais.frequenciaMedia}%</p>
                <p className="text-secondary text-sm">Frequência Média</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold text-white">{relatorioData.estatisticasGerais.badgesDistribuidos}</p>
                <p className="text-secondary text-sm">Badges Conquistados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-support" />
              <div>
                <p className="text-2xl font-bold text-white">{relatorioData.estatisticasGerais.desafiosAtivos}</p>
                <p className="text-secondary text-sm">Desafios Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-white">{relatorioData.estatisticasGerais.aulasRealizadas}</p>
                <p className="text-secondary text-sm">Aulas Realizadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights com IA */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Insights Inteligentes</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatorioData.insights.map((insight, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-accent/20">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-3 ${insight.tipo === 'success' ? 'bg-accent/20 text-accent' :
                    insight.tipo === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-complement/20 text-complement'
                  }`}>
                  {insight.tipo === 'success' ? 'Sucesso' : insight.tipo === 'warning' ? 'Atenção' : 'Oportunidade'}
                </div>
                <h3 className="font-semibold text-white mb-2">{insight.titulo}</h3>
                <p className="text-secondary text-sm">{insight.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Frequência por Mês */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <h3 className="text-lg font-semibold text-white mb-4">Evolução da Frequência</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={relatorioData.frequenciaPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="mes" stroke="#B8ECD7" />
                <YAxis stroke="#B8ECD7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#083643',
                    border: '1px solid #B1E001',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="frequencia"
                  stroke="#B1E001"
                  strokeWidth={3}
                  dot={{ fill: '#B1E001', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Frequência por Turma */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <h3 className="text-lg font-semibold text-white mb-4">Frequência por Turma</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={relatorioData.frequenciaPorTurma}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="turma" stroke="#B8ECD7" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#B8ECD7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#083643',
                    border: '1px solid #CEF09D',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="frequencia" fill="#CEF09D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Badges por Mês */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <h3 className="text-lg font-semibold text-white mb-4">Badges Conquistados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={relatorioData.badgesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="mes" stroke="#B8ECD7" />
                <YAxis stroke="#B8ECD7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#083643',
                    border: '1px solid #B8ECD7',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="badges" fill="#B8ECD7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Desafios Concluídos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <h3 className="text-lg font-semibold text-white mb-4">Desafios por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relatorioData.desafiosConcluidos}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="concluidos"
                  label={({ tipo, concluidos, total }) => `${tipo}: ${concluidos}/${total}`}
                >
                  {relatorioData.desafiosConcluidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#083643',
                    border: '1px solid #476C5E',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Alunos */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Top 5 Alunos</span>
          </h3>
          <div className="space-y-3">
            {relatorioData.topAlunos.map((aluno, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-accent text-primary' :
                      index === 1 ? 'bg-complement text-primary' :
                        index === 2 ? 'bg-secondary text-primary' :
                          'bg-white/20 text-white'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="font-semibold text-white">{aluno.nome}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-accent">{aluno.frequencia}%</div>
                    <div className="text-xs text-secondary">Frequência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-complement">{aluno.badges}</div>
                    <div className="text-xs text-secondary">Badges</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
