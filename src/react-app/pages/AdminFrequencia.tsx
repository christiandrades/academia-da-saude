import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  Upload,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Plus
} from 'lucide-react';
import { Link } from 'react-router';

interface FrequenciaRecord {
  id: number;
  user_id: number;
  aula_id: number;
  status: 'PRESENTE' | 'ATRASO' | 'FALTA';
  fonte: 'GOOGLE_FORMS' | 'MANUAL';
  user_nome: string;
  aula_data: string;
  turma_nome: string;
}

interface Aula {
  id: number;
  data: string;
  turma_nome: string;
  tema_opcional: string;
}

interface User {
  id: number;
  nome: string;
  turma_id: number;
}

export default function AdminFrequencia() {
  const { user, isPending } = useAuth();
  const [, setUserProfile] = useState<any>(null);
  const [frequencias, setFrequencias] = useState<FrequenciaRecord[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAula, setSelectedAula] = useState<string>('');
  const [formData, setFormData] = useState({
    aula_id: '',
    user_id: '',
    status: 'PRESENTE' as 'PRESENTE' | 'ATRASO' | 'FALTA'
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
      const [frequenciasRes, aulasRes, usersRes] = await Promise.all([
        fetch('/api/admin/frequencias'),
        fetch('/api/admin/aulas'),
        fetch('/api/admin/usuarios')
      ]);

      const frequenciasData = await frequenciasRes.json();
      const aulasData = await aulasRes.json();
      const usersData = await usersRes.json();

      setFrequencias(frequenciasData);
      setAulas(aulasData);
      setUsers(usersData.filter((u: any) => u.role === 'student'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/frequencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fonte: 'MANUAL' })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ aula_id: '', user_id: '', status: 'PRESENTE' });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao registrar frequência:', error);
    }
  };

  const handleGoogleFormsImport = async () => {
    try {
      const response = await fetch('/api/admin/frequencias/import-google-forms', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Dados do Google Forms importados com sucesso!');
        fetchData();
      } else {
        alert('Erro ao importar dados do Google Forms');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar dados');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENTE':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'ATRASO':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'FALTA':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENTE':
        return 'text-accent bg-accent/20';
      case 'ATRASO':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'FALTA':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-white bg-white/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const filteredFrequencias = selectedAula
    ? frequencias.filter(f => f.aula_id.toString() === selectedAula)
    : frequencias;

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
                <Users className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold text-white">Gestão de Frequência</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoogleFormsImport}
                className="bg-complement text-primary px-4 py-2 rounded-lg font-semibold hover:bg-complement/90 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Google Forms</span>
              </button>
              <button
                onClick={() => {
                  setFormData({ aula_id: '', user_id: '', status: 'PRESENTE' });
                  setShowForm(true);
                }}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6 flex items-center space-x-4">
          <select
            value={selectedAula}
            onChange={(e) => setSelectedAula(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
          >
            <option value="" className="bg-primary text-white">Todas as aulas</option>
            {aulas.map((aula) => (
              <option key={aula.id} value={aula.id.toString()} className="bg-primary text-white">
                {formatDate(aula.data)} - {aula.turma_nome}
              </option>
            ))}
          </select>

          <button className="bg-support text-white px-4 py-2 rounded-lg hover:bg-support/90 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Registrar Frequência</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Aula</label>
                  <select
                    value={formData.aula_id}
                    onChange={(e) => setFormData({ ...formData, aula_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="" className="bg-primary text-white">Selecione uma aula</option>
                    {aulas.map((aula) => (
                      <option key={aula.id} value={aula.id.toString()} className="bg-primary text-white">
                        {formatDate(aula.data)} - {aula.turma_nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Aluno</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="" className="bg-primary text-white">Selecione um aluno</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id.toString()} className="bg-primary text-white">
                        {user.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="PRESENTE" className="bg-primary text-white">Presente</option>
                    <option value="ATRASO" className="bg-primary text-white">Atraso</option>
                    <option value="FALTA" className="bg-primary text-white">Falta</option>
                  </select>
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
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Frequências */}
        <div className="grid gap-3">
          {filteredFrequencias.map((freq) => (
            <div key={freq.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(freq.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(freq.status)}`}>
                      {freq.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white">{freq.user_nome}</h4>
                    <p className="text-secondary text-sm">
                      {formatDate(freq.aula_data)} - {freq.turma_nome}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-secondary text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{freq.fonte === 'GOOGLE_FORMS' ? 'Google Forms' : 'Manual'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFrequencias.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum registro de frequência encontrado
            </h3>
            <p className="text-secondary mb-4">
              {selectedAula
                ? 'Não há registros de frequência para esta aula.'
                : 'Comece registrando a frequência dos alunos.'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Primeiro Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
