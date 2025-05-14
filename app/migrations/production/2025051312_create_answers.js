const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela answers.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS answer (
      id BIGSERIAL PRIMARY KEY,
      answer_text TEXT NOT NULL,
      correct BOOLEAN NOT NULL DEFAULT FALSE,
      score INT,
      id_question BIGINT NOT NULL,
      FOREIGN KEY (id_question) REFERENCES question(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "answer" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "answer"', err.message);
    throw err;
  }
}

module.exports = { migrate };
