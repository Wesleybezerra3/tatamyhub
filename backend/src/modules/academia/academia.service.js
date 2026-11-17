import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AcademiaRepository } from './academia.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AcademiaService {
  static async getProfile(academiaId = 1) {
    const profile = await AcademiaRepository.getProfile(academiaId);
    return profile;
  }

  static async saveProfile(data) {
    // Validações obrigatórias
    if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length < 2) {
      const error = new Error('O nome da academia é obrigatório e deve ter pelo menos 2 caracteres.');
      error.status = 400;
      throw error;
    }

    if (data.nome.trim().length > 150) {
      const error = new Error('O nome da academia não pode ultrapassar 150 caracteres.');
      error.status = 400;
      throw error;
    }

    const hasPhone = data.telefone && data.telefone.trim().length > 0;
    const hasWhatsapp = data.whatsapp && data.whatsapp.trim().length > 0;
    if (!hasPhone && !hasWhatsapp) {
      const error = new Error('Informe pelo menos um meio de contato direto (telefone ou WhatsApp).');
      error.status = 400;
      throw error;
    }

    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        const error = new Error('Formato de e-mail inválido.');
        error.status = 400;
        throw error;
      }
    }

    const sanitizedData = {
      ...data,
      nome: data.nome.trim(),
      documento: data.documento ? data.documento.trim() : null,
      email: data.email ? data.email.trim() : null,
      telefone: data.telefone ? data.telefone.trim() : null,
      whatsapp: data.whatsapp ? data.whatsapp.trim() : null,
      logradouro: data.logradouro ? data.logradouro.trim() : null,
      numero: data.numero ? data.numero.trim() : null,
      complemento: data.complemento ? data.complemento.trim() : null,
      bairro: data.bairro ? data.bairro.trim() : null,
      cidade: data.cidade ? data.cidade.trim() : null,
      estado: data.estado ? data.estado.trim().toUpperCase().slice(0, 2) : null,
      cep: data.cep ? data.cep.trim() : null,
      chave_pix: data.chave_pix ? data.chave_pix.trim() : null,
      tipo_chave_pix: data.tipo_chave_pix ? data.tipo_chave_pix.trim().toLowerCase() : null,
      beneficiario_pix: data.beneficiario_pix ? data.beneficiario_pix.trim() : null,
      msg_cobranca_pendente: data.msg_cobranca_pendente !== undefined ? (data.msg_cobranca_pendente ? data.msg_cobranca_pendente.trim() : null) : undefined,
      msg_cobranca_atrasada: data.msg_cobranca_atrasada !== undefined ? (data.msg_cobranca_atrasada ? data.msg_cobranca_atrasada.trim() : null) : undefined
    };

    return await AcademiaRepository.upsertProfile(sanitizedData);
  }

  static async handleLogoUpload(file, academiaId = 1) {
    if (!file) {
      const error = new Error('Nenhum arquivo de imagem foi enviado.');
      error.status = 400;
      throw error;
    }

    const current = await AcademiaRepository.getProfile(academiaId);
    if (current && current.logo_url) {
      this.deletePhysicalLogo(current.logo_url);
    }

    const logoUrl = `/uploads/logos/${file.filename}`;
    const updated = await AcademiaRepository.updateLogo(academiaId, logoUrl);
    return { logo_url: updated.logo_url };
  }

  static async removeLogo(academiaId = 1) {
    const current = await AcademiaRepository.getProfile(academiaId);
    if (current && current.logo_url) {
      this.deletePhysicalLogo(current.logo_url);
    }
    const updated = await AcademiaRepository.updateLogo(academiaId, null);
    return updated;
  }

  static deletePhysicalLogo(logoUrl) {
    try {
      if (!logoUrl) return;
      const relativePath = logoUrl.replace(/^\//, '');
      const absolutePath = path.join(__dirname, '../../../', relativePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (err) {
      console.warn('[AcademiaService] Aviso ao remover arquivo físico de logo:', err.message);
    }
  }
}
