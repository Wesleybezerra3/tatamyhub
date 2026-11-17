import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Building, Phone, Layers, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    nome_academia: '',
    whatsapp: '',
    modalidade_inicial: 'Jiu-Jitsu'
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validações no cliente
    if (!formData.nome.trim() || formData.nome.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Informe seu nome completo (mínimo 2 caracteres).' });
      return;
    }

    if (!formData.email.trim()) {
      setFeedback({ type: 'error', message: 'Informe seu e-mail de acesso.' });
      return;
    }

    if (formData.senha.length < 6) {
      setFeedback({ type: 'error', message: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setFeedback({ type: 'error', message: 'As senhas informadas não coincidem.' });
      return;
    }

    if (!formData.nome_academia.trim() || formData.nome_academia.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Informe o nome da sua academia.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.register({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        nome_academia: formData.nome_academia.trim(),
        whatsapp: formData.whatsapp ? formData.whatsapp.trim() : null,
        modalidade_inicial: formData.modalidade_inicial.trim() || 'Jiu-Jitsu'
      });

      // Redireciona para o login com o e-mail pré-preenchido e mensagem de sucesso
      navigate('/login', {
        state: {
          email: formData.email.trim().toLowerCase(),
          successMessage: response.message || 'Conta criada com sucesso! Faça login para começar.'
        }
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao realizar cadastro.' });
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
            <h1 className={styles.title}>Criar sua Conta</h1>
            <p className={styles.subtitle}>
              Configure seu acesso de gestor e cadastre sua academia para começar.
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
            {/* Seção 1: Dados do Gestor */}
            <div className={styles.sectionHeader}>
              <User size={16} className={styles.sectionIcon} />
              <span>Seus Dados de Acesso</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="nome">Nome Completo</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.fieldIcon} />
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Mestre Carlos Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email">E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.fieldIcon} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.field}>
                <label htmlFor="senha">Senha (mín. 6)</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.fieldIcon} />
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.fieldIcon} />
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Dados da Academia */}
            <div className={styles.sectionHeader} style={{ marginTop: '12px' }}>
              <Building size={16} className={styles.sectionIcon} />
              <span>Sua Academia & Tatame</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="nome_academia">Nome da Academia</label>
              <div className={styles.inputWrapper}>
                <Building size={18} className={styles.fieldIcon} />
                <input
                  id="nome_academia"
                  name="nome_academia"
                  type="text"
                  placeholder="Ex: Gracie Barra Centro"
                  value={formData.nome_academia}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.field}>
                <label htmlFor="whatsapp">WhatsApp de Contato</label>
                <div className={styles.inputWrapper}>
                  <Phone size={18} className={styles.fieldIcon} />
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="modalidade_inicial">Modalidade Inicial</label>
                <div className={styles.inputWrapper}>
                  <Layers size={18} className={styles.fieldIcon} />
                  <input
                    id="modalidade_inicial"
                    name="modalidade_inicial"
                    type="text"
                    placeholder="Ex: Jiu-Jitsu"
                    value={formData.modalidade_inicial}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
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
                  <span>Criando conta e academia...</span>
                </>
              ) : (
                <>
                  <span>Criar Minha Conta</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <footer className={styles.cardFooter}>
            <p>
              Já tem uma conta cadastrada?{' '}
              <Link to="/login" className={styles.loginLink}>
                Faça login aqui
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
