const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,
      first_name CHAR(50) NOT NULL,
      last_name CHAR(50) NOT NULL,
      email CHAR(100) NOT NULL UNIQUE,
      username CHAR(50) NOT NULL UNIQUE,
      password CHAR(255) NOT NULL,
      avatar CHAR(255),
      birth_date DATE,
      CONSTRAINT chk_email CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "users" criada com sucesso no ambiente de produção.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "users" no ambiente de produção:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();