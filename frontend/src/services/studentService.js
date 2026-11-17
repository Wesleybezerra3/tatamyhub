import { api } from './api';

export const studentService = {
  /**
   * Lista alunos com filtros opcionais
   */
  async listStudents(filters = {}) {
    return api.get('/alunos', filters);
  },

  /**
   * Obtém detalhes de um aluno por ID
   */
  async getStudentById(id) {
    return api.get(`/alunos/${id}`);
  },

  /**
   * Cadastra novo aluno
   */
  async createStudent(data) {
    return api.post('/alunos', data);
  },

  /**
   * Atualiza dados de um aluno
   */
  async updateStudent(id, data) {
    return api.put(`/alunos/${id}`, data);
  },

  /**
   * Alterna status do aluno (ativo / inativo)
   */
  async setStudentStatus(id, status) {
    return api.patch(`/alunos/${id}/status`, { status });
  },

  /**
   * Registra nova graduação / promoção de faixa
   */
  async addGraduation(id, data) {
    return api.post(`/alunos/${id}/graduacoes`, data);
  },

  /**
   * Exclui o aluno e todos os dados vinculados em cascata
   */
  async deleteStudent(id) {
    return api.delete(`/alunos/${id}`);
  }
};
