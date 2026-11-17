import pool from '../config/database.js';

async function testConnection() {
  console.log('[Supabase] Testando conexão com o PostgreSQL...');
  try {
    const [rows] = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name, version();');
    console.log('[Supabase] Conexão estabelecida com sucesso!');
    console.log('[Supabase] Banco:', rows[0].db_name);
    console.log('[Supabase] Hora no servidor:', rows[0].current_time);
    console.log('[Supabase] Versão:', rows[0].version);
    process.exit(0);
  } catch (error) {
    console.error('[Supabase] Falha ao conectar:', error.message || error);
    console.error('[Supabase] Detalhes do erro:', {
      code: error.code,
      name: error.name,
      detail: error.detail,
      hint: error.hint
    });
    process.exit(1);
  }
}

testConnection();
