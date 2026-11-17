import { ModalidadesRepository } from './modalidades.repository.js';
import { AcademiaRepository } from '../academia/academia.repository.js';

export class ModalidadesService {
  static async list(academiaId = 1, status = null) {
    return await ModalidadesRepository.listByAcademiaId(academiaId, status);
  }

  static async getById(id, academiaId = null) {
    const modalidade = await ModalidadesRepository.findById(id);
    if (!modalidade || (academiaId && modalidade.academia_id !== academiaId)) {
      const error = new Error('Modalidade não encontrada.');
      error.status = 404;
      throw error;
    }
    return modalidade;
  }

  static async create({ academia_id = 1, nome, descricao, status = 'ativa' }) {
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
      const error = new Error('O nome da modalidade é obrigatório e deve ter pelo menos 2 caracteres.');
      error.status = 400;
      throw error;
    }

    if (nome.trim().length > 100) {
      const error = new Error('O nome da modalidade não pode ultrapassar 100 caracteres.');
      error.status = 400;
      throw error;
    }

    const validStatuses = ['ativa', 'inativa'];
    if (status && !validStatuses.includes(status)) {
      const error = new Error("Status inválido. Deve ser 'ativa' ou 'inativa'.");
      error.status = 400;
      throw error;
    }

    // Garantir que a academia existe
    let academia = await AcademiaRepository.getProfile(academia_id);
    if (!academia) {
      academia = await AcademiaRepository.upsertProfile({
        nome: 'Minha Academia',
        whatsapp: '000000000'
      });
    }

    // Verificar duplicidade de nome
    const duplicate = await ModalidadesRepository.findByName(academia.id, nome.trim());
    if (duplicate) {
      const error = new Error(`Já existe uma modalidade cadastrada com o nome "${nome.trim()}".`);
      error.status = 400;
      throw error;
    }

    return await ModalidadesRepository.create({
      academia_id: academia.id,
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : null,
      status: status || 'ativa'
    });
  }

  static async update(id, { nome, descricao, status }, academiaId = null) {
    const current = await this.getById(id, academiaId);

    if (nome !== undefined) {
      if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
        const error = new Error('O nome da modalidade deve ter pelo menos 2 caracteres.');
        error.status = 400;
        throw error;
      }
      if (nome.trim().length > 100) {
        const error = new Error('O nome da modalidade não pode ultrapassar 100 caracteres.');
        error.status = 400;
        throw error;
      }

      const duplicate = await ModalidadesRepository.findByName(current.academia_id, nome.trim(), id);
      if (duplicate) {
        const error = new Error(`Já existe outra modalidade com o nome "${nome.trim()}".`);
        error.status = 400;
        throw error;
      }
    }

    if (status !== undefined) {
      const validStatuses = ['ativa', 'inativa'];
      if (!validStatuses.includes(status)) {
        const error = new Error("Status inválido. Deve ser 'ativa' ou 'inativa'.");
        error.status = 400;
        throw error;
      }
    }

    return await ModalidadesRepository.update(id, {
      nome: nome ? nome.trim() : undefined,
      descricao: descricao !== undefined ? (descricao ? descricao.trim() : null) : undefined,
      status
    });
  }
}
