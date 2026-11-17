import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configura o parser de NUMERIC/DECIMAL do PostgreSQL para retornar Number (como no MySQL)
pg.types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

let poolConfig = {};

if (process.env.DB_HOST && process.env.DB_PASSWORD) {
  // Configuração explícita (mais segura com senhas contendo caracteres como @, %, :)
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '6543', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  };
} else if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  };
} else {
  poolConfig = {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres'
  };
}

const pgPool = new pg.Pool(poolConfig);

pgPool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

/**
 * Tradutor de queries MySQL -> PostgreSQL:
 * 1. Converte funções específicas (CURDATE -> CURRENT_DATE, CAST AS DOUBLE -> FLOAT, etc.)
 * 2. Converte placeholders '?' em '$1', '$2', ...
 * 3. Garante 'RETURNING id' em comandos INSERT para manter compatibilidade com result.insertId
 */
function translateQuery(sql, params = []) {
  if (!sql || typeof sql !== 'string') {
    return { sql, params };
  }

  let translated = sql
    .replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE')
    .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/CAST\((.+?)\s+AS\s+DOUBLE\)/gi, 'CAST($1 AS FLOAT)')
    .replace(/MONTH\((.+?)\)/gi, 'EXTRACT(MONTH FROM $1)')
    .replace(/YEAR\((.+?)\)/gi, 'EXTRACT(YEAR FROM $1)')
    .replace(/table_schema\s*=\s*DATABASE\(\)/gi, "table_schema = 'public'");

  let paramIndex = 1;
  let inString = false;
  let quoteChar = '';
  let resultSql = '';

  for (let i = 0; i < translated.length; i++) {
    const char = translated[i];
    if ((char === "'" || char === '"') && (i === 0 || translated[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inString = false;
      }
      resultSql += char;
    } else if (char === '?' && !inString) {
      resultSql += `$${paramIndex++}`;
    } else {
      resultSql += char;
    }
  }

  // Em comandos INSERT, se não houver RETURNING, injeta RETURNING id para simular insertId
  const isInsert = /^\s*INSERT\s+INTO\b/i.test(resultSql);
  if (isInsert && !/\bRETURNING\b/i.test(resultSql)) {
    resultSql = resultSql.trim().replace(/;+$/, '') + ' RETURNING id';
  }

  return { sql: resultSql, params };
}

/**
 * Wrapper de execução para formatar o retorno idêntico ao mysql2 ([rows, fields])
 */
async function executeQueryOnClient(clientOrPool, sql, params = []) {
  const { sql: finalSql, params: finalParams } = translateQuery(sql, params);
  const result = await clientOrPool.query(finalSql, finalParams);

  const rows = result.rows || [];
  rows.insertId = rows.length > 0 && rows[0]?.id !== undefined ? rows[0].id : null;
  rows.affectedRows = result.rowCount !== null && result.rowCount !== undefined ? result.rowCount : 0;

  return [rows, result.fields || []];
}

const pool = {
  /**
   * Executa uma query no pool Postgres simulando a assinatura do mysql2
   */
  async query(sql, params = []) {
    return executeQueryOnClient(pgPool, sql, params);
  },

  /**
   * Obtém uma conexão com suporte a transações (getConnection, beginTransaction, commit, rollback, release)
   */
  async getConnection() {
    const client = await pgPool.connect();

    return {
      query: (sql, params = []) => executeQueryOnClient(client, sql, params),
      beginTransaction: async () => {
        await client.query('BEGIN');
      },
      commit: async () => {
        await client.query('COMMIT');
      },
      rollback: async () => {
        await client.query('ROLLBACK');
      },
      release: () => {
        client.release();
      }
    };
  },

  async end() {
    await pgPool.end();
  }
};

export default pool;
