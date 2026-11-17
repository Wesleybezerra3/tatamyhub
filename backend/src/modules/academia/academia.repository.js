import pool from '../../config/database.js';

export class AcademiaRepository {
  /**
   * Obtém o perfil da primeira academia ativa ou por id
   */
  static async getProfile(academiaId = 1) {
    const [rows] = await pool.query(
      'SELECT * FROM academias WHERE id = ? LIMIT 1',
      [academiaId]
    );
    if (rows.length > 0) {
      return rows[0];
    }

    // Se não encontrou pelo id específico, tenta buscar a primeira existente
    const [firstRows] = await pool.query('SELECT * FROM academias ORDER BY id ASC LIMIT 1');
    return firstRows.length > 0 ? firstRows[0] : null;
  }

  /**
   * Cria ou atualiza os dados da academia
   */
  static async upsertProfile(data) {
    const current = await this.getProfile(data.id || 1);

    if (!current) {
      const [result] = await pool.query(
        `INSERT INTO academias (
          nome, documento, email, telefone, whatsapp,
          logradouro, numero, complemento, bairro, cidade, estado, cep, logo_url,
          chave_pix, tipo_chave_pix, beneficiario_pix,
          msg_cobranca_pendente, msg_cobranca_atrasada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.nome,
          data.documento || null,
          data.email || null,
          data.telefone || null,
          data.whatsapp || null,
          data.logradouro || null,
          data.numero || null,
          data.complemento || null,
          data.bairro || null,
          data.cidade || null,
          data.estado || null,
          data.cep || null,
          data.logo_url || null,
          data.chave_pix || null,
          data.tipo_chave_pix || null,
          data.beneficiario_pix || null,
          data.msg_cobranca_pendente || null,
          data.msg_cobranca_atrasada || null
        ]
      );
      return this.getProfile(result.insertId);
    }

    await pool.query(
      `UPDATE academias SET
        nome = ?,
        documento = ?,
        email = ?,
        telefone = ?,
        whatsapp = ?,
        logradouro = ?,
        numero = ?,
        complemento = ?,
        bairro = ?,
        cidade = ?,
        estado = ?,
        cep = ?,
        logo_url = COALESCE(?, logo_url),
        chave_pix = ?,
        tipo_chave_pix = ?,
        beneficiario_pix = ?,
        msg_cobranca_pendente = ?,
        msg_cobranca_atrasada = ?
      WHERE id = ?`,
      [
        data.nome,
        data.documento || null,
        data.email || null,
        data.telefone || null,
        data.whatsapp || null,
        data.logradouro || null,
        data.numero || null,
        data.complemento || null,
        data.bairro || null,
        data.cidade || null,
        data.estado || null,
        data.cep || null,
        data.logo_url !== undefined ? data.logo_url : null,
        data.chave_pix !== undefined ? (data.chave_pix ? data.chave_pix.trim() : null) : current.chave_pix,
        data.tipo_chave_pix !== undefined ? (data.tipo_chave_pix ? data.tipo_chave_pix.trim() : null) : current.tipo_chave_pix,
        data.beneficiario_pix !== undefined ? (data.beneficiario_pix ? data.beneficiario_pix.trim() : null) : current.beneficiario_pix,
        data.msg_cobranca_pendente !== undefined ? (data.msg_cobranca_pendente ? data.msg_cobranca_pendente.trim() : null) : current.msg_cobranca_pendente,
        data.msg_cobranca_atrasada !== undefined ? (data.msg_cobranca_atrasada ? data.msg_cobranca_atrasada.trim() : null) : current.msg_cobranca_atrasada,
        current.id
      ]
    );

    return this.getProfile(current.id);
  }

  /**
   * Atualiza especificamente o logo_url da academia
   */
  static async updateLogo(academiaId, logoUrl) {
    const current = await this.getProfile(academiaId);
    if (!current) {
      // Se ainda não existia registro, cria um com nome inicial padrão
      const [result] = await pool.query(
        'INSERT INTO academias (nome, logo_url) VALUES (?, ?)',
        ['Minha Academia', logoUrl]
      );
      return this.getProfile(result.insertId);
    }

    await pool.query(
      'UPDATE academias SET logo_url = ? WHERE id = ?',
      [logoUrl, current.id]
    );
    return this.getProfile(current.id);
  }
}
