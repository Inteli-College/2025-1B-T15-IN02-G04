const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela questions.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS question (
      id BIGSERIAL PRIMARY KEY,
      question_text TEXT NOT NULL,
      id_test BIGINT NOT NULL,
      FOREIGN KEY (id_test) REFERENCES test(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "question" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "question"', err.message);
    throw err;
  }
}

module.exports = { migrate };
