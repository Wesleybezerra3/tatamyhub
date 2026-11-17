import { api } from './api';

export const academyService = {
  async getProfile() {
    return await api.get('/academia');
  },

  async updateProfile(profileData) {
    return await api.put('/academia', profileData);
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    return await api.upload('/academia/logo', formData);
  },

  async deleteLogo() {
    return await api.delete('/academia/logo');
  }
};
