import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router';

interface Aula {
  id: number;
  turma_id: number;
  data: string;
  tema_opcional: string;
  turma_nome: string;
  total_frequencias: number;
  presentes: number;
}

interface Turma {
  id: number;
  nome: string;
}

export default function AdminAulas() {
  const { user, isPending } = useAuth();
  const [, setUserProfile] = useState<any>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [formData, setFormData] = useState({
    turma_id: '',
    data: '',
    tema_opcional: ''
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
      const [aulasRes, turmasRes] = await Promise.all([
        fetch('/api/admin/aulas'),
        fetch('/api/admin/turmas')
      ]);

      const aulasData = await aulasRes.json();
      const turmasData = await turmasRes.json();

      setAulas(aulasData);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAulasByTurma = async (turmaId: string) => {
    try {
      const response = await fetch(`/api/admin/aulas?turma_id=${turmaId}`);
      const data = await response.json();
      setAulas(data);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ turma_id: '', data: '', tema_opcional: '' });
        if (selectedTurma) {
          fetchAulasByTurma(selectedTurma);
        } else {
          fetchData();
        }
      }
    } catch (error) {
      console.error('Erro ao criar aula:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getFrequencyPercentage = (presentes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((presentes / total) * 100);
  };

  const getFrequencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-accent';
    if (percentage >= 60) return 'text-complement';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const filteredAulas = selectedTurma
    ? aulas.filter(aula => aula.turma_id.toString() === selectedTurma)
    : aulas;

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
                <FileText className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Gestão de Aulas</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ turma_id: '', data: '', tema_opcional: '' });
                setShowForm(true);
              }}
              className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Aula</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={selectedTurma}
              onChange={(e) => {
                setSelectedTurma(e.target.value);
                if (e.target.value) {
                  fetchAulasByTurma(e.target.value);
                } else {
                  fetchData();
                }
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id.toString()}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Nova Aula</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Turma</label>
                  <select
                    value={formData.turma_id}
                    onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="" className="bg-primary text-white">Selecione uma turma</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id.toString()} className="bg-primary text-white">
                        {turma.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Tema (opcional)</label>
                  <input
                    type="text"
                    value={formData.tema_opcional}
                    onChange={(e) => setFormData({ ...formData, tema_opcional: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    placeholder="Ex: Exercícios Cardiovasculares"
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
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Aulas */}
        <div className="grid gap-4">
          {filteredAulas.map((aula) => {
            const percentage = getFrequencyPercentage(aula.presentes, aula.total_frequencias);

            return (
              <div key={aula.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-semibold text-white">
                        {formatDate(aula.data)} - {aula.turma_nome}
                      </h3>
                    </div>

                    {aula.tema_opcional && (
                      <p className="text-secondary mb-3">{aula.tema_opcional}</p>
                    )}

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-white font-semibold">{aula.total_frequencias}</span>
                        <span className="text-secondary text-sm">registrados</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-complement" />
                        <span className="text-white font-semibold">{aula.presentes}</span>
                        <span className="text-secondary text-sm">presentes</span>
                      </div>

                      {aula.total_frequencias > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-semibold ${getFrequencyColor(percentage)}`}>
                            {percentage}% frequência
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/aulas/${aula.id}/frequencia`}
                      className="p-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {aula.total_frequencias === 0 ? (
                      <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                        <XCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 bg-complement/20 text-complement rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAulas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedTurma ? 'Nenhuma aula encontrada para esta turma' : 'Nenhuma aula cadastrada'}
            </h3>
            <p className="text-secondary mb-4">
              {selectedTurma
                ? 'Crie a primeira aula para esta turma.'
                : 'Comece criando aulas para suas turmas.'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Criar Nova Aula
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
