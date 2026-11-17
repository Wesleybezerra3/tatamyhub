import { api } from './api';

export const authService = {
  async register(onboardingData) {
    return await api.post('/auth/register', onboardingData);
  },

  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  async deleteAccount(credentials) {
    return await api.delete('/auth/account', credentials);
  }
};
