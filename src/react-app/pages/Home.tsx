import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/auth';
import { Heart, Users, Trophy, Calendar, ArrowRight, Activity, User } from 'lucide-react';

export default function Home() {
  const { user, redirectToLogin, isPending } = useAuth();
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    // Se o usuário está logado, redireciona para o dashboard
    if (user) {
      window.location.href = '/dashboard';
      return;
    }

    // Carrega as turmas para mostrar na página pública
    fetch('/api/turmas')
      .then(res => res.json())
      .then(data => setTurmas(data))
      .catch(console.error);
  }, [user]);

  const handleLogin = () => {
    redirectToLogin();
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-support">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-support to-primary">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm border-b border-accent/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Academia da Saúde</h1>
                <p className="text-secondary text-sm">Arapiraca - AL</p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="bg-accent hover:bg-accent/90 text-primary font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>Acessar Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Sua jornada de <span className="text-accent">saúde</span> agora é um jogo
            </h2>
            <p className="text-xl text-secondary mb-12 leading-relaxed">
              Acompanhe sua frequência, ganhe badges, supere desafios e faça parte de uma comunidade
              que valoriza seu bem-estar. A Academia da Saúde Arapiraca transforma cuidado em diversão!
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-accent/20">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Acompanhe sua frequência</h3>
                <p className="text-secondary">
                  Veja seu progresso em tempo real e mantenha-se motivado com metas alcançáveis
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-accent/20">
                <div className="w-16 h-16 bg-complement rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Ganhe recompensas</h3>
                <p className="text-secondary">
                  Conquiste badges e selos especiais por sua dedicação e consistência
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-accent/20">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Conecte-se</h3>
                <p className="text-secondary">
                  Faça parte de uma comunidade que se apoia mutuamente na jornada da saúde
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Info Section */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">Acesso ao Sistema</h3>
            <p className="text-lg text-secondary mb-12 leading-relaxed">
              Nossa plataforma atende diferentes tipos de usuários, cada um com suas funcionalidades específicas
              para uma experiência completa na Academia da Saúde.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-accent/20">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">👨‍🎓 Alunos</h4>
                <ul className="text-secondary text-sm space-y-2">
                  <li>• Acompanhar frequência e progresso</li>
                  <li>• Ganhar badges e conquistas</li>
                  <li>• Participar do ranking</li>
                  <li>• Ver próximas aulas</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-complement/20">
                <div className="w-16 h-16 bg-complement rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">👨‍🏫 Instrutores</h4>
                <ul className="text-secondary text-sm space-y-2">
                  <li>• Registrar frequência dos alunos</li>
                  <li>• Gerenciar suas aulas</li>
                  <li>• Acompanhar estatísticas</li>
                  <li>• Visualizar relatórios</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-secondary/20">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">🛡️ Administradores</h4>
                <ul className="text-secondary text-sm space-y-2">
                  <li>• Gestão completa de turmas</li>
                  <li>• Controle de usuários</li>
                  <li>• Relatórios detalhados</li>
                  <li>• Configurações do sistema</li>
                </ul>
              </div>
            </div>

            <div className="bg-accent/10 backdrop-blur-sm rounded-xl p-6 border border-accent/20">
              <h4 className="text-lg font-semibold text-white mb-3">🔐 Como Acessar</h4>
              <p className="text-secondary">
                Todos os usuários fazem login pelo mesmo botão acima. O sistema automaticamente
                direciona você para a área apropriada baseada no seu perfil cadastrado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">Sobre a Academia da Saúde</h3>
            <p className="text-lg text-secondary mb-12 leading-relaxed">
              O programa Academia da Saúde é uma estratégia de promoção da saúde e produção do cuidado,
              que tem como objetivo contribuir para a promoção da saúde da população a partir da
              implantação de polos com infraestrutura, equipamentos e quadro de pessoal qualificado
              para a orientação de práticas corporais e atividade física.
            </p>

            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div>
                <h4 className="text-xl font-semibold text-accent mb-4">🎯 Nossos Objetivos</h4>
                <ul className="space-y-3 text-secondary">
                  <li>• Promover práticas corporais e atividade física</li>
                  <li>• Fortalecer vínculos sociais e comunitários</li>
                  <li>• Melhorar a qualidade de vida da população</li>
                  <li>• Prevenir doenças crônicas não transmissíveis</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-accent mb-4">⭐ Como Funciona</h4>
                <ul className="space-y-3 text-secondary">
                  <li>• Atividades supervisionadas por profissionais</li>
                  <li>• Horários flexíveis para diferentes grupos</li>
                  <li>• Acompanhamento personalizado do progresso</li>
                  <li>• Sistema de gamificação para motivação</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Turmas Section */}
      {turmas.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white text-center mb-12">Nossas Turmas</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {turmas.map((turma: any) => (
                  <div key={turma.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-accent/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-accent" />
                      <h4 className="text-xl font-semibold text-white">{turma.nome}</h4>
                    </div>
                    <div className="space-y-2 text-secondary">
                      <p><strong>Horário:</strong> {turma.horario}</p>
                      <p><strong>Instrutor:</strong> {turma.instrutor}</p>
                      <p><strong>Local:</strong> {turma.local}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-accent to-complement">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-primary mb-6">
              Pronto para transformar sua saúde?
            </h3>
            <p className="text-lg text-primary/80 mb-8">
              Junte-se a centenas de pessoas que já descobriram que cuidar da saúde pode ser divertido!
            </p>
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-lg flex items-center space-x-2 mx-auto"
              >
                <span>Acessar Sistema</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-primary/60 text-sm">
                Para alunos, instrutores e administradores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary border-t border-accent/20 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-secondary">
            © 2024 Academia da Saúde Arapiraca. Promovendo saúde e bem-estar para nossa comunidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
