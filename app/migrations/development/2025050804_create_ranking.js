const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela ranking.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS ranking (
      id BIGINT PRIMARY KEY,
      id_user BIGINT NOT NULL,
      position INT NOT NULL,
      CONSTRAINT fk_ranking_user FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT chk_position CHECK (position >= 1)
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "ranking" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "ranking" no ambiente de desenvolvimento:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();