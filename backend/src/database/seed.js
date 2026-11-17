import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('[Seed] Iniciando semeadura de dados padrão...');

  try {
    // 1. Verificar se já existe academia cadastrada
    const [academias] = await pool.query('SELECT id FROM academias LIMIT 1');
    let academiaId;

    if (academias.length === 0) {
      const [res] = await pool.query(
        `INSERT INTO academias (nome, telefone, whatsapp, logradouro, bairro, cidade, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Academia TatamyHub BJJ', '(11) 3456-7890', '(11) 98765-4321', 'Rua do Tatame, 100', 'Centro', 'São Paulo', 'SP']
      );
      academiaId = res.insertId;
      console.log(`[Seed] Academia inicial criada com id: ${academiaId}`);
    } else {
      academiaId = academias[0].id;
      console.log(`[Seed] Academia já existente com id: ${academiaId}`);
    }

    // 2. Verificar se já existe a modalidade Jiu-Jitsu
    const [modalidades] = await pool.query(
      'SELECT id FROM modalidades WHERE academia_id = ? AND LOWER(nome) = ?',
      [academiaId, 'jiu-jitsu']
    );

    if (modalidades.length === 0) {
      await pool.query(
        `INSERT INTO modalidades (academia_id, nome, descricao, status)
         VALUES (?, ?, ?, ?)`,
        [academiaId, 'Jiu-Jitsu', 'Aulas tradicionais com quimono (Gi) para todas as graduações', 'ativa']
      );
      console.log('[Seed] Modalidade padrão "Jiu-Jitsu" inserida com sucesso.');
    } else {
      console.log('[Seed] Modalidade "Jiu-Jitsu" já cadastrada.');
    }

    // 3. Verificar se já existe o usuário administrador padrão
    const [usuarios] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      ['admin@tatamyhub.com']
    );

    if (usuarios.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('admin123', salt);

      await pool.query(
        `INSERT INTO usuarios (academia_id, nome, email, senha_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [academiaId, 'Administrador TatamyHub', 'admin@tatamyhub.com', senhaHash, 'admin']
      );
      console.log('[Seed] Usuário admin padrão criado: admin@tatamyhub.com / senha: admin123');
    } else {
      console.log('[Seed] Usuário admin padrão já existente.');
    }

    console.log('[Seed] Semeadura finalizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Erro durante semeadura:', error);
    process.exit(1);
  }
}

seed();
