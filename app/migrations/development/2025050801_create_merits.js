const pool = require('../../config/db.js')

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela merits.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE DATABASE IF NOT EXISTS learning_platform;
    \\c learning_platform;

    CREATE TABLE IF NOT EXISTS merits (
      id BIGINT PRIMARY KEY,
      name CHAR(100) NOT NULL,
      description CHAR(255)
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "merits" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "merits" no ambiente de desenvolvimento:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();