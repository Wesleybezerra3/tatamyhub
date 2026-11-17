import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/configuracoes/academia', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Se vier redirecionado de um cadastro recém-concluído
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.successMessage) {
      setFeedback({ type: 'success', message: location.state.successMessage });
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !senha) {
      setFeedback({ type: 'error', message: 'Informe seu e-mail e senha.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        senha
      });

      // Salva no contexto de autenticação
      login(response.token, response.usuario, response.academia);

      // Redireciona para o destino pretendido ou área de configurações
      const from = location.state?.from?.pathname || '/configuracoes/academia';
      navigate(from, { replace: true });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'E-mail ou senha incorretos.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoBadge}>
            <ShieldCheck size={22} className={styles.brandIcon} />
          </div>
          <span className={styles.brandName}>TatamyHub</span>
        </Link>
      </header>

      <main className={styles.cardContainer}>
        <div className={styles.authCard}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Entrar na sua Conta</h1>
            <p className={styles.subtitle}>
              Acesse o painel financeiro e de alunos da sua academia.
            </p>
          </div>

          {feedback && (
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">E-mail de Acesso</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="senha">Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.fieldIcon} />
                <input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className={styles.spinner} size={20} />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <footer className={styles.cardFooter}>
            <p>
              Ainda não tem uma conta?{' '}
              <Link to="/cadastro" className={styles.registerLink}>
                Criar conta gratuita
              </Link>
            </p>
            <p style={{ marginTop: 8 }}>
              É aluno da academia?{' '}
              <Link to="/aluno/login" className={styles.registerLink} style={{ color: '#38BDF8' }}>
                Acessar Área do Aluno
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
