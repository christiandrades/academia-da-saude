import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Link } from 'react-router';

interface Turma {
  id: number;
  nome: string;
  horario: string;
  instrutor: string;
  local: string;
  total_alunos: number;
  total_aulas: number;
}

export default function AdminTurmas() {
  const { user, isPending } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    horario: '',
    instrutor: '',
    local: ''
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
      fetchTurmas();
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const fetchTurmas = async () => {
    try {
      const response = await fetch('/api/admin/turmas');
      const data = await response.json();
      setTurmas(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingTurma ? 'PUT' : 'POST';
      const url = editingTurma ? `/api/admin/turmas/${editingTurma.id}` : '/api/admin/turmas';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTurma(null);
        setFormData({ nome: '', horario: '', instrutor: '', local: '' });
        fetchTurmas();
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      horario: turma.horario,
      instrutor: turma.instrutor,
      local: turma.local
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const response = await fetch(`/api/admin/turmas/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTurmas();
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
    }
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
                <Calendar className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Gestão de Turmas</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingTurma(null);
                setFormData({ nome: '', horario: '', instrutor: '', local: '' });
                setShowForm(true);
              }}
              className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Turma</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Nome da Turma</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: GAF 01 - Manhã"
                    required
                  />
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Horário</label>
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: 08:00 - 09:30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Instrutor</label>
                  <input
                    type="text"
                    value={formData.instrutor}
                    onChange={(e) => setFormData({ ...formData, instrutor: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: Prof. Maria Silva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Local</label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: Polo Academia da Saúde"
                    required
                  />
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
                    {editingTurma ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Turmas */}
        <div className="grid gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-semibold text-white">{turma.nome}</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{turma.horario}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary">
                      <User className="w-4 h-4" />
                      <span>{turma.instrutor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span>{turma.local}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-white font-semibold">{turma.total_alunos}</span>
                      <span className="text-secondary text-sm">alunos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-complement" />
                      <span className="text-white font-semibold">{turma.total_aulas}</span>
                      <span className="text-secondary text-sm">aulas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(turma)}
                    className="p-2 bg-complement/20 text-complement rounded-lg hover:bg-complement/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(turma.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {turmas.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma turma cadastrada</h3>
            <p className="text-secondary mb-4">
              Comece criando a primeira turma da Academia da Saúde.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Criar Primeira Turma
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
