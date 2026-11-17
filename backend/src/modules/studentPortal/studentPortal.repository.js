import pool from '../../config/database.js';

export class StudentPortalRepository {
  /**
   * Localiza candidatos a aluno por telefone (com ou sem DDD/55), e-mail ou nome
   */
  static async findCandidatesByLogin(identificador) {
    if (!identificador) return [];

    const cleanInput = String(identificador).trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const cleanDigitsNoCountry = cleanDigits.replace(/^55/, '');

    const [rows] = await pool.query(
      `SELECT a.*, ac.nome AS academia_nome, ac.logo_url AS academia_logo_url, ac.whatsapp AS academia_whatsapp,
              ac.email AS academia_email, ac.documento AS academia_documento
       FROM alunos a
       JOIN academias ac ON ac.id = a.academia_id
       WHERE a.status = 'ativo'
         AND (
           LOWER(TRIM(a.email)) = LOWER(?)
           OR REPLACE(REPLACE(REPLACE(REPLACE(a.telefone, ' ', ''), '-', ''), '(', ''), ')', '') IN (?, ?, ?)
         )
       ORDER BY (a.senha_hash IS NOT NULL) DESC, a.id DESC`,
      [cleanInput, cleanDigits, cleanDigitsNoCountry, `55${cleanDigitsNoCountry}`]
    );

    return rows;
  }

  static async findByLogin(identificador) {
    const candidates = await this.findCandidatesByLogin(identificador);
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Localiza aluno por ID com dados da academia
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.id, a.academia_id, a.nome, a.telefone, a.email, a.data_nascimento,
              a.data_matricula, a.status, a.primeiro_acesso, a.ultimo_login,
              ac.nome AS academia_nome, ac.logo_url AS academia_logo_url,
              ac.whatsapp AS academia_whatsapp, ac.email AS academia_email, ac.documento AS academia_documento,
              ac.chave_pix, ac.tipo_chave_pix, ac.beneficiario_pix
       FROM alunos a
       JOIN academias ac ON ac.id = a.academia_id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Atualiza a senha e marca que não é mais primeiro acesso
   */
  static async updatePassword(alunoId, senhaHash) {
    const [result] = await pool.query(
      'UPDATE alunos SET senha_hash = ?, primeiro_acesso = FALSE WHERE id = ?',
      [senhaHash, alunoId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Atualiza a data do último login
   */
  static async updateLastLogin(alunoId) {
    await pool.query(
      'UPDATE alunos SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
      [alunoId]
    );
  }

  /**
   * Retorna graduação atual e histórico marcial
   */
  static async getGraduations(alunoId, academiaId) {
    // 1. Modalidades e faixas atuais
    const [current] = await pool.query(
      `SELECT am.id, am.modalidade_id, m.nome AS modalidade_nome,
              am.faixa_atual, am.graus_atual, am.data_inicio
       FROM aluno_modalidades am
       JOIN modalidades m ON m.id = am.modalidade_id
       WHERE am.aluno_id = ? AND m.academia_id = ?
       ORDER BY am.id ASC`,
      [alunoId, academiaId]
    );

    // 2. Histórico de promoções
    const [history] = await pool.query(
      `SELECT gh.id, gh.modalidade_id, m.nome AS modalidade_nome,
              gh.faixa, gh.graus, gh.data_graduacao, gh.observacao
       FROM graduacoes_historico gh
       JOIN modalidades m ON m.id = gh.modalidade_id
       WHERE gh.aluno_id = ? AND m.academia_id = ?
       ORDER BY gh.data_graduacao DESC, gh.id DESC`,
      [alunoId, academiaId]
    );

    return {
      atual: current.length > 0 ? current[0] : null,
      modalidades: current,
      historico: history
    };
  }

  /**
   * Retorna mensalidades do aluno
   */
  static async getInvoices(alunoId, academiaId, status = null) {
    let sql = `
      SELECT m.id, m.academia_id, m.aluno_id, m.valor, m.valor_pago,
             m.data_vencimento, m.competencia, m.status, m.observacoes, m.created_at,
             ac.chave_pix, ac.tipo_chave_pix, ac.beneficiario_pix,
             ac.whatsapp AS chave_pix_whatsapp, ac.email AS chave_pix_email, ac.documento AS chave_pix_documento
      FROM mensalidades m
      JOIN academias ac ON ac.id = m.academia_id
      WHERE m.aluno_id = ? AND m.academia_id = ?
    `;
    const params = [alunoId, academiaId];

    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY m.data_vencimento DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  }
}
