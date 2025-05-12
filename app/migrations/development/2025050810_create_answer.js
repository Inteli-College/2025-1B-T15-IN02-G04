const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela answer.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS answer (
      id BIGINT PRIMARY KEY,
      answer VARCHAR(255) NOT NULL,
      correct BOOLEAN NOT NULL,
      id_question BIGINT NOT NULL,
      CONSTRAINT fk_answer_question FOREIGN KEY (id_question) REFERENCES question(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "answer" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "answer" no ambiente de desenvolvimento:', err.message);
    throw err;
  }
}

module.exports = { migrate };