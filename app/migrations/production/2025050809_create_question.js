const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela question.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS question (
      id BIGINT PRIMARY KEY,
      question CHAR(255) NOT NULL,
      score BIGINT NOT NULL,
      id_course BIGINT NOT NULL,
      CONSTRAINT fk_question_course FOREIGN KEY (id_course) REFERENCES course(id) ON DELETE CASCADE,
      CONSTRAINT chk_score CHECK (score >= 0)
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "question" criada com sucesso no ambiente de produção.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "question" no ambiente de produção:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();