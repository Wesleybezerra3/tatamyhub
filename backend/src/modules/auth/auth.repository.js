import pool from '../../config/database.js';

export class AuthRepository {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.academia_id, u.nome, u.email, u.role, u.created_at,
              a.nome AS academia_nome, a.logo_url AS academia_logo_url
       FROM usuarios u
       JOIN academias a ON a.id = u.academia_id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findRawUserById(id) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Exclusão da conta da academia (dispara DELETE CASCADE no MySQL para usuários, modalidades, alunos, mensalidades, pagamentos)
   */
  static async deleteAccount(academiaId) {
    const [result] = await pool.query('DELETE FROM academias WHERE id = ?', [academiaId]);
    return result.affectedRows > 0;
  }

  /**
   * Criação atômica em transação: Academia + Modalidade Inicial + Usuário Gestor
   */
  static async registerOnboarding({ nome, email, senha_hash, nome_academia, whatsapp, modalidade_inicial }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Inserir a Academia
      const [academiaRes] = await connection.query(
        'INSERT INTO academias (nome, whatsapp) VALUES (?, ?)',
        [nome_academia, whatsapp || null]
      );
      const academiaId = academiaRes.insertId;

      // 2. Inserir a Modalidade Esportiva Inicial
      const modalidadeNome = modalidade_inicial && modalidade_inicial.trim() ? modalidade_inicial.trim() : 'Jiu-Jitsu';
      await connection.query(
        'INSERT INTO modalidades (academia_id, nome, status) VALUES (?, ?, ?)',
        [academiaId, modalidadeNome, 'ativa']
      );

      // 3. Inserir o Usuário Administrador
      const [usuarioRes] = await connection.query(
        'INSERT INTO usuarios (academia_id, nome, email, senha_hash, role) VALUES (?, ?, ?, ?, ?)',
        [academiaId, nome, email, senha_hash, 'admin']
      );
      const usuarioId = usuarioRes.insertId;

      await connection.commit();

      return {
        id: usuarioId,
        academia_id: academiaId,
        nome,
        email,
        role: 'admin',
        academia_nome: nome_academia
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}
