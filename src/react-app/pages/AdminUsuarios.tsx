import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  GraduationCap,
  User,
  Award,
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';
import { Link } from 'react-router';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  turma_id: number | null;
  turma_nome: string | null;
  foto_url: string | null;
  total_frequencias: number;
  total_badges: number;
  frequencia_percentual: number;
  created_at: string;
}

interface Turma {
  id: number;
  nome: string;
}

export default function AdminUsuarios() {
  const { user, isPending } = useAuth();
  const [, setUserProfile] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [turmaFilter, setTurmaFilter] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'student' as 'student' | 'instructor' | 'admin',
    turma_id: ''
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

      if (profile.role !== 'admin') {
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
      const [usuariosRes, turmasRes] = await Promise.all([
        fetch('/api/admin/usuarios'),
        fetch('/api/admin/turmas')
      ]);

      const usuariosData = await usuariosRes.json();
      const turmasData = await turmasRes.json();

      setUsuarios(usuariosData);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      turma_id: usuario.turma_id?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/usuarios/${editingUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turma_id: formData.turma_id ? parseInt(formData.turma_id) : null
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingUser(null);
        setFormData({ nome: '', email: '', role: 'student', turma_id: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const exportarUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios/export', {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `usuarios-academia-saude-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar usuários:', error);
      alert('Funcionalidade de exportação será implementada em breve');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'instructor':
        return <GraduationCap className="w-4 h-4 text-complement" />;
      default:
        return <User className="w-4 h-4 text-accent" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'instructor':
        return 'Instrutor';
      default:
        return 'Aluno';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-400/20 text-red-400';
      case 'instructor':
        return 'bg-complement/20 text-complement';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || usuario.role === roleFilter;
    const matchesTurma = turmaFilter === '' || usuario.turma_id?.toString() === turmaFilter;

    return matchesSearch && matchesRole && matchesTurma;
  });

  const estatisticas = {
    totalUsuarios: usuarios.length,
    alunos: usuarios.filter(u => u.role === 'student').length,
    instrutores: usuarios.filter(u => u.role === 'instructor').length,
    admins: usuarios.filter(u => u.role === 'admin').length
  };

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
                <h1 className="text-xl font-bold text-white">Gestão de Usuários</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportarUsuarios}
                className="bg-complement text-primary px-4 py-2 rounded-lg font-semibold hover:bg-complement/90 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Convidar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-white">{estatisticas.totalUsuarios}</p>
                <p className="text-secondary text-sm">Total de Usuários</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-white">{estatisticas.alunos}</p>
                <p className="text-secondary text-sm">Alunos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-complement" />
              <div>
                <p className="text-2xl font-bold text-white">{estatisticas.instrutores}</p>
                <p className="text-secondary text-sm">Instrutores</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{estatisticas.admins}</p>
                <p className="text-secondary text-sm">Administradores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-accent/20">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-secondary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
              >
                <option value="" className="bg-primary text-white">Todos os roles</option>
                <option value="student" className="bg-primary text-white">Alunos</option>
                <option value="instructor" className="bg-primary text-white">Instrutores</option>
                <option value="admin" className="bg-primary text-white">Administradores</option>
              </select>
            </div>

            <select
              value={turmaFilter}
              onChange={(e) => setTurmaFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
            >
              <option value="" className="bg-primary text-white">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id.toString()} className="bg-primary text-white">
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal de Edição */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-accent/20 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Editar Usuário</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary text-sm mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    required
                  >
                    <option value="student" className="bg-primary text-white">Aluno</option>
                    <option value="instructor" className="bg-primary text-white">Instrutor</option>
                    <option value="admin" className="bg-primary text-white">Administrador</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-secondary text-sm mb-2">Turma</label>
                    <select
                      value={formData.turma_id}
                      onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-primary [&>option]:text-white"
                    >
                      <option value="" className="bg-primary text-white">Sem turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id.toString()} className="bg-primary text-white">
                          {turma.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="space-y-4">
          {filteredUsuarios.map((usuario) => (
            <div key={usuario.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {usuario.foto_url ? (
                      <img
                        src={usuario.foto_url}
                        alt={usuario.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-accent" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1">
                      {getRoleIcon(usuario.role)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-white">{usuario.nome}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(usuario.role)}`}>
                        {getRoleLabel(usuario.role)}
                      </span>
                    </div>
                    <p className="text-secondary text-sm">{usuario.email}</p>
                    {usuario.turma_nome && (
                      <p className="text-accent text-sm">{usuario.turma_nome}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {usuario.role === 'student' && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center space-x-1 text-accent">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">{usuario.frequencia_percentual || 0}%</span>
                        </div>
                        <div className="text-xs text-secondary">Frequência</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center space-x-1 text-complement">
                          <Award className="w-4 h-4" />
                          <span className="font-semibold">{usuario.total_badges}</span>
                        </div>
                        <div className="text-xs text-secondary">Badges</div>
                      </div>
                    </>
                  )}

                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-secondary">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(usuario.created_at)}</span>
                    </div>
                    <div className="text-xs text-secondary">Cadastro</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="p-2 bg-complement/20 text-complement rounded-lg hover:bg-complement/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum usuário encontrado</h3>
            <p className="text-secondary mb-4">
              {searchTerm || roleFilter || turmaFilter
                ? 'Tente ajustar os filtros de busca.'
                : 'Não há usuários cadastrados no sistema.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
