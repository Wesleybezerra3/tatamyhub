import { useState, useEffect, useCallback } from 'react';
import { academyService } from '../services/academyService';

export function useAcademy() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('tatamyhub_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await academyService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar os dados da academia.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (formData) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await academyService.updateProfile(formData);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Falha ao salvar as informações da academia.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file) => {
    setSaving(true);
    setError(null);
    try {
      const result = await academyService.uploadLogo(file);
      setProfile(prev => prev ? { ...prev, logo_url: result.logo_url } : { logo_url: result.logo_url });
      return result;
    } catch (err) {
      setError(err.message || 'Falha ao fazer upload da imagem.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = async () => {
    setSaving(true);
    setError(null);
    try {
      await academyService.deleteLogo();
      setProfile(prev => prev ? { ...prev, logo_url: null } : null);
    } catch (err) {
      setError(err.message || 'Falha ao remover o logotipo.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    fetchProfile,
    saveProfile,
    uploadLogo,
    removeLogo
  };
}
