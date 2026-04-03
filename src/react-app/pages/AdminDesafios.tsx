import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  Target,
  Plus,
  Edit,
  Trash2,
  Award,
  Calendar,
  TrendingUp,
  Users,
  Play,
  Pause,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router';

interface Desafio {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'FREQUENCIA' | 'SEQUENCIA' | 'ATIVIDADE';
  meta_valor: number;
  meta_periodo: 'DIARIO' | 'SEMANAL' | 'MENSAL';
  badge_id: number | null;
  badge_titulo: string | null;
  data_inicio: string;
  data_fim: string;
  is_ativo: boolean;
  participantes: number;
  concluidos: number;
}

interface Badge {
  id: number;
  titulo: string;
  slug: string;
}

export default function AdminDesafios() {
  const { user, isPending } = useAuth();
  const [, setUserProfile] = useState<any>(null);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDesafio, setEditingDesafio] = useState<Desafio | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'FREQUENCIA' as 'FREQUENCIA' | 'SEQUENCIA' | 'ATIVIDADE',
    meta_valor: '',
    meta_periodo: 'SEMANAL' as 'DIARIO' | 'SEMANAL' | 'MENSAL',
    badge_id: '',
    data_inicio: '',
    data_fim: ''
  });

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
      fetchData();
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [desafiosRes, badgesRes] = await Promise.all([
        fetch('/api/admin/desafios'),
        fetch('/api/admin/badges')
      ]);

      const desafiosData = await desafiosRes.json();
      const badgesData = await badgesRes.json();

      setDesafios(desafiosData);
      setBadges(badgesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingDesafio ? 'PUT' : 'POST';
      const url = editingDesafio ? `/api/admin/desafios/${editingDesafio.id}` : '/api/admin/desafios';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          meta_valor: parseInt(formData.meta_valor),
          badge_id: formData.badge_id ? parseInt(formData.badge_id) : null
        })
      });

      if (response.ok) {
        setShowForm(false);
        setEditingDesafio(null);
        setFormData({
          titulo: '', descricao: '', tipo: 'FREQUENCIA', meta_valor: '',
          meta_periodo: 'SEMANAL', badge_id: '', data_inicio: '', data_fim: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao salvar desafio:', error);
    }
  };

  const handleEdit = (desafio: Desafio) => {
    setEditingDesafio(desafio);
    setFormData({
      titulo: desafio.titulo,
      descricao: desafio.descricao,
      tipo: desafio.tipo,
      meta_valor: desafio.meta_valor.toString(),
      meta_periodo: desafio.meta_periodo,
      badge_id: desafio.badge_id?.toString() || '',
      data_inicio: desafio.data_inicio,
      data_fim: desafio.data_fim
    });
    setShowForm(true);
  };

  const toggleDesafio = async (id: number, ativo: boolean) => {
    try {
      await fetch(`/api/admin/desafios/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_ativo: !ativo })
      });
      fetchData();
    } catch (error) {
      console.error('Erro ao alterar status do desafio:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;

    try {
      const response = await fetch(`/api/admin/desafios/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao excluir desafio:', error);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'FREQUENCIA':
        return 'bg-accent/20 text-accent';
      case 'SEQUENCIA':
        return 'bg-complement/20 text-complement';
      case 'ATIVIDADE':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-white/20 text-white';
    }
  };

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case 'DIARIO':
        return 'Diário';
      case 'SEMANAL':
        return 'Semanal';
      case 'MENSAL':
        return 'Mensal';
      default:
        return periodo;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getProgressPercentage = (concluidos: number, participantes: number) => {
    if (participantes === 0) return 0;
    return Math.round((concluidos / participantes) * 100);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
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
                <Target className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Gestão de Desafios</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingDesafio(null);
                setFormData({
                  titulo: '', descricao: '', tipo: 'FREQUENCIA', meta_valor: '',
                  meta_periodo: 'SEMANAL', badge_id: '', data_inicio: '', data_fim: ''
                });
                setShowForm(true);
              }}
              className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Desafio</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingDesafio ? 'Editar Desafio' : 'Novo Desafio'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: Frequência Perfeita"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary h-20"
                    placeholder="Descreva o objetivo do desafio..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary text-sm mb-2">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                      required
                    >
                      <option value="FREQUENCIA" className="bg-primary text-white">Frequência</option>
                      <option value="SEQUENCIA" className="bg-primary text-white">Sequência</option>
                      <option value="ATIVIDADE" className="bg-primary text-white">Atividade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-secondary text-sm mb-2">Meta</label>
                    <input
                      type="number"
                      value={formData.meta_valor}
                      onChange={(e) => setFormData({ ...formData, meta_valor: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                      placeholder="Ex: 90"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Período</label>
                  <select
                    value={formData.meta_periodo}
                    onChange={(e) => setFormData({ ...formData, meta_periodo: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="DIARIO" className="bg-primary text-white">Diário</option>
                    <option value="SEMANAL" className="bg-primary text-white">Semanal</option>
                    <option value="MENSAL" className="bg-primary text-white">Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Badge Recompensa</label>
                  <select
                    value={formData.badge_id}
                    onChange={(e) => setFormData({ ...formData, badge_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                  >
                    <option value="" className="bg-primary text-white">Nenhum badge</option>
                    {badges.map((badge) => (
                      <option key={badge.id} value={badge.id.toString()} className="bg-primary text-white">
                        {badge.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary text-sm mb-2">Data Início</label>
                    <input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-secondary text-sm mb-2">Data Fim</label>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                  >
                    {editingDesafio ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Desafios */}
        <div className="grid gap-6">
          {desafios.map((desafio) => {
            const progressPercentage = getProgressPercentage(desafio.concluidos, desafio.participantes);

            return (
              <div key={desafio.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-6 h-6 text-accent" />
                      <h3 className="text-xl font-semibold text-white">{desafio.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTipoColor(desafio.tipo)}`}>
                        {desafio.tipo}
                      </span>
                      {!desafio.is_ativo && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-400/20 text-red-400">
                          Inativo
                        </span>
                      )}
                    </div>

                    <p className="text-secondary mb-4">{desafio.descricao}</p>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-secondary">
                        <Trophy className="w-4 h-4" />
                        <span>Meta: {desafio.meta_valor} {getPeriodoLabel(desafio.meta_periodo)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(desafio.data_inicio)} - {formatDate(desafio.data_fim)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-secondary">
                        <Users className="w-4 h-4" />
                        <span>{desafio.participantes} participantes</span>
                      </div>

                      {desafio.badge_titulo && (
                        <div className="flex items-center space-x-2 text-secondary">
                          <Award className="w-4 h-4" />
                          <span>Badge: {desafio.badge_titulo}</span>
                        </div>
                      )}
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-secondary">Progresso Geral</span>
                        <span className="text-white font-semibold">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-accent rounded-full h-2 transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-secondary mt-1">
                        <span>{desafio.concluidos} concluídos</span>
                        <span>{desafio.participantes} total</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleDesafio(desafio.id, desafio.is_ativo)}
                      className={`p-2 rounded-lg transition-colors ${desafio.is_ativo
                          ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                          : 'bg-accent/20 text-accent hover:bg-accent/30'
                        }`}
                    >
                      {desafio.is_ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleEdit(desafio)}
                      className="p-2 bg-complement/20 text-complement rounded-lg hover:bg-complement/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(desafio.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {desafios.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum desafio cadastrado</h3>
            <p className="text-secondary mb-4">
              Comece criando desafios para motivar os alunos da Academia da Saúde.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Criar Primeiro Desafio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
