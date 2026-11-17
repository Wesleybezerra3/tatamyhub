import { api } from './api';

export const modalityService = {
  async listModalities(status = 'todas') {
    return await api.get('/modalidades', { status });
  },

  async getModality(id) {
    return await api.get(`/modalidades/${id}`);
  },

  async createModality(modalityData) {
    return await api.post('/modalidades', modalityData);
  },

  async updateModality(id, updateData) {
    return await api.put(`/modalidades/${id}`, updateData);
  }
};
