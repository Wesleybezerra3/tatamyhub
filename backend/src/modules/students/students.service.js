import { StudentsRepository } from './students.repository.js';

export class StudentsService {
  /**
   * Sanitiza telefone para manter apenas dígitos numéricos
   */
  static sanitizePhone(phone) {
    if (!phone) return null;
    const digits = phone.toString().replace(/\D/g, '');
    return digits || null;
  }

  /**
   * Valida datas para impedir datas futuras
   */
  static validateDate(dateStr, fieldName = 'Data') {
    if (!dateStr) return;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} inválida.`);
    }

    if (date > today) {
      throw new Error(`${fieldName} não pode ser no futuro.`);
    }
  }

  /**
   * Listar alunos
   */
  static async list(academiaId, filters = {}) {
    if (!academiaId) throw new Error('Identificador da academia é obrigatório.');
    return StudentsRepository.list(academiaId, filters);
  }

  /**
   * Buscar aluno por ID
   */
  static async getById(academiaId, alunoId) {
    if (!academiaId) throw new Error('Identificador da academia é obrigatório.');
    if (!alunoId) throw new Error('Identificador do aluno é obrigatório.');

    const aluno = await StudentsRepository.findById(academiaId, alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado.');
    }
    return aluno;
  }

  /**
   * Cadastrar aluno
   */
  static async create(academiaId, data, usuarioId = null) {
    if (!academiaId) throw new Error('Identificador da academia é obrigatório.');
    if (!data.nome || data.nome.trim().length < 2) {
      throw new Error('O nome do aluno deve conter pelo menos 2 caracteres.');
    }

    const sanitizedPhone = this.sanitizePhone(data.telefone);
    if (data.data_matricula) {
      this.validateDate(data.data_matricula, 'Data de matrícula');
    }
    if (data.data_nascimento) {
      this.validateDate(data.data_nascimento, 'Data de nascimento');
    }

    if (data.dia_vencimento !== undefined) {
      const dia = parseInt(data.dia_vencimento, 10);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        throw new Error('O dia de vencimento deve estar entre 1 e 31.');
      }
    }

    if (data.valor_mensalidade !== undefined && data.valor_mensalidade !== '' && data.valor_mensalidade !== null) {
      const val = Number(data.valor_mensalidade);
      if (isNaN(val) || val < 0) {
        throw new Error('O valor da mensalidade deve ser um número positivo.');
      }
    }

    const graus = data.graus_inicial !== undefined ? parseInt(data.graus_inicial, 10) : 0;
    if (isNaN(graus) || graus < 0 || graus > 4) {
      throw new Error('Os graus da graduação devem ser um número entre 0 e 4.');
    }

    if (data.dia_vencimento !== undefined) {
      const dia = parseInt(data.dia_vencimento, 10);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        throw new Error('O dia de vencimento deve estar entre 1 e 31.');
      }
    }

    if (data.valor_mensalidade !== undefined && data.valor_mensalidade !== '' && data.valor_mensalidade !== null) {
      const val = Number(data.valor_mensalidade);
      if (isNaN(val) || val < 0) {
        throw new Error('O valor da mensalidade deve ser um número positivo.');
      }
    }

    const payload = {
      ...data,
      telefone: sanitizedPhone,
      graus_inicial: graus
    };

    const newId = await StudentsRepository.create(academiaId, payload, usuarioId);
    return this.getById(academiaId, newId);
  }

  /**
   * Atualizar aluno
   */
  static async update(academiaId, alunoId, data) {
    if (!academiaId) throw new Error('Identificador da academia é obrigatório.');
    if (!alunoId) throw new Error('Identificador do aluno é obrigatório.');

    if (data.nome !== undefined && data.nome.trim().length < 2) {
      throw new Error('O nome do aluno deve conter pelo menos 2 caracteres.');
    }

    const payload = { ...data };
    if (data.telefone !== undefined) {
      payload.telefone = this.sanitizePhone(data.telefone);
    }
    if (data.data_matricula) {
      this.validateDate(data.data_matricula, 'Data de matrícula');
    }
    if (data.data_nascimento) {
      this.validateDate(data.data_nascimento, 'Data de nascimento');
    }

    if (data.dia_vencimento !== undefined) {
      const dia = parseInt(data.dia_vencimento, 10);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        throw new Error('O dia de vencimento deve estar entre 1 e 31.');
      }
    }

    if (data.valor_mensalidade !== undefined && data.valor_mensalidade !== '' && data.valor_mensalidade !== null) {
      const val = Number(data.valor_mensalidade);
      if (isNaN(val) || val < 0) {
        throw new Error('O valor da mensalidade deve ser um número positivo.');
      }
    }

    const updated = await StudentsRepository.update(academiaId, alunoId, payload);
    if (!updated) {
      throw new Error('Aluno não encontrado para atualização.');
    }

    return this.getById(academiaId, alunoId);
  }

  /**
   * Alternar status (Ativo / Inativo)
   */
  static async setStatus(academiaId, alunoId, status) {
    if (!['ativo', 'inativo'].includes(status)) {
      throw new Error("Status inválido. Use 'ativo' ou 'inativo'.");
    }

    const updated = await StudentsRepository.setStatus(academiaId, alunoId, status);
    if (!updated) {
      throw new Error('Aluno não encontrado para alteração de status.');
    }

    return { id: alunoId, status };
  }

  /**
   * Registrar nova graduação / promoção
   */
  static async addGraduation(academiaId, alunoId, data, usuarioId = null) {
    if (!data.modalidade_id) {
      throw new Error('Modalidade é obrigatória para registrar graduação.');
    }
    if (!data.faixa || !data.faixa.trim()) {
      throw new Error('A faixa da graduação é obrigatória.');
    }

    const graus = data.graus !== undefined ? parseInt(data.graus, 10) : 0;
    if (isNaN(graus) || graus < 0 || graus > 4) {
      throw new Error('Os graus da graduação devem ser um número entre 0 e 4.');
    }

    if (data.data_graduacao) {
      this.validateDate(data.data_graduacao, 'Data da graduação');
    }

    const payload = {
      ...data,
      graus
    };

    await StudentsRepository.addGraduation(academiaId, alunoId, payload, usuarioId);
    return this.getById(academiaId, alunoId);
  }

  /**
   * Excluir aluno e todos os dados vinculados em cascata
   */
  static async delete(academiaId, alunoId) {
    const aluno = await StudentsRepository.findById(academiaId, alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado para exclusão.');
    }

    await StudentsRepository.delete(academiaId, alunoId);
    return { message: 'Aluno e todos os dados vinculados foram excluídos com sucesso.' };
  }
}
