import { api } from './api';

export const studentPortalService = {
  /**
   * Autenticação do aluno (telefone ou e-mail + senha)
   */
  async login(credentials) {
    return await api.post('/aluno/login', credentials);
  },

  /**
   * Dados do aluno autenticado
   */
  async getMe() {
    return await api.get('/aluno/me');
  },

  /**
   * Hub consolidado (faixa marcial, faturas, resumo e alertas)
   */
  async getHub() {
    return await api.get('/aluno/hub');
  },

  /**
   * Lista de mensalidades do aluno
   */
  async getInvoices(filters = {}) {
    return await api.get('/aluno/mensalidades', filters);
  },

  /**
   * Aluno troca a própria senha
   */
  async changePassword(data) {
    return await api.post('/aluno/trocar-senha', data);
  },

  /**
   * Administrador/Gestor define a senha inicial do aluno
   */
  async setStudentCredentials(alunoId, data) {
    return await api.patch(`/alunos/${alunoId}/credenciais`, data);
  }
};
