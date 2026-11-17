import pool from '../../config/database.js';

export class ModalidadesRepository {
  static async listByAcademiaId(academiaId = 1, status = null) {
    let query = 'SELECT * FROM modalidades WHERE academia_id = ?';
    const params = [academiaId];

    if (status && status !== 'todas') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY status ASC, nome ASC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM modalidades WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByName(academiaId, nome, excludeId = null) {
    let query = 'SELECT * FROM modalidades WHERE academia_id = ? AND LOWER(TRIM(nome)) = LOWER(TRIM(?))';
    const params = [academiaId, nome];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  static async create({ academia_id = 1, nome, descricao, status = 'ativa' }) {
    const [result] = await pool.query(
      `INSERT INTO modalidades (academia_id, nome, descricao, status)
       VALUES (?, ?, ?, ?)`,
      [academia_id, nome, descricao || null, status]
    );
    return this.findById(result.insertId);
  }

  static async update(id, { nome, descricao, status }) {
    const current = await this.findById(id);
    if (!current) return null;

    const newNome = nome !== undefined ? nome : current.nome;
    const newDescricao = descricao !== undefined ? descricao : current.descricao;
    const newStatus = status !== undefined ? status : current.status;

    await pool.query(
      `UPDATE modalidades SET
        nome = ?,
        descricao = ?,
        status = ?
       WHERE id = ?`,
      [newNome, newDescricao, newStatus, id]
    );

    return this.findById(id);
  }
}
