import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useStudentAuth } from '../../hooks/useStudentAuth';
import { studentPortalService } from '../../services/studentPortalService';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './StudentLoginPage.module.css';

export function StudentLoginPage() {
  const navigate = useNavigate();
  const { login } = useStudentAuth();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identificador.trim() || !senha) {
      setError('Preencha seu telefone ou e-mail e sua senha de acesso.');
      return;
    }

    try {
      setLoading(true);
      const res = await studentPortalService.login({
        identificador: identificador.trim(),
        senha
      });

      login(res.token, res.aluno, res.academia);
      navigate('/aluno', { replace: true });
    } catch (err) {
      setError(err.message || 'Falha ao autenticar no portal do aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Shield size={28} />
          </div>
          <h1 className={styles.title}>Área do Aluno</h1>
          <p className={styles.subtitle}>
            Acesse seu prontuário marcial, graduação atual e faturas da academia.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="studentIdentificador">Telefone ou E-mail</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input
                id="studentIdentificador"
                type="text"
                placeholder="DDD + Número ou E-mail"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                disabled={loading}
                className={styles.input}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="studentPassword">Senha de Acesso</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="studentPassword"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
                className={styles.input}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Entrando no Hub...</span>
              </>
            ) : (
              <>
                <span>Acessar Meu Hub</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footerNotes}>
          <p className={styles.helpText}>
            Primeiro acesso ou esqueceu a senha? Solicite ao seu mestre ou à secretaria da academia.
          </p>
          <Link to="/login" className={styles.adminLink}>
            É gestor ou professor? Acessar Painel Administrativo
          </Link>
        </div>
      </div>
    </div>
  );
}
