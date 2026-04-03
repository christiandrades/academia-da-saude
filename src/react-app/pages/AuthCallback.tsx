import { useEffect } from 'react';
import { useAuth } from '../../shared/auth';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        // Redireciona para o dashboard após o login bem-sucedido
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Erro no callback de autenticação:', error);
        // Redireciona de volta para a home em caso de erro
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-support flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Finalizando seu login...</h2>
        <p className="text-secondary">Aguarde enquanto preparamos sua área pessoal</p>
      </div>
    </div>
  );
}
