import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tatamyhub';

  const isCloudHost = (host.includes('tidbcloud.com') || host.includes('aivencloud.com') || host.includes('railway') || process.env.DB_SSL === 'true');
  const sslConfig = isCloudHost ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

  console.log(`[Migrations] Conectando ao MySQL em ${host}:${port} (SSL: ${isCloudHost ? 'Ativo' : 'Desativado'})...`);

  // Se não for nuvem, tenta criar o banco caso não exista
  if (!isCloudHost) {
    try {
      const initConnection = await mysql.createConnection({ host, port, user, password, connectTimeout: 10000 });
      await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await initConnection.end();
    } catch (initErr) {
      console.warn('[Migrations] Aviso ao inicializar database local:', initErr.message);
    }
  }

  // Conectar diretamente ao banco da aplicação
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    connectTimeout: 30000,
    ssl: sslConfig
  });

  try {
    // Tabela de controle de migrations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [rows] = await connection.query('SELECT name FROM _migrations');
    const executedMigrations = new Set(rows.map(r => r.name));

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (!executedMigrations.has(file)) {
        console.log(`[Migrations] Executando: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await connection.query(sql);
        await connection.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
        console.log(`[Migrations] Concluído: ${file}`);
      } else {
        console.log(`[Migrations] Já executada: ${file}`);
      }
    }

    console.log('[Migrations] Todas as migrations foram processadas com sucesso!');
  } catch (error) {
    console.error('[Migrations] Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
