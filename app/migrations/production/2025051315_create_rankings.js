const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela rankings.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS ranking (
      id BIGSERIAL PRIMARY KEY,
      id_user BIGINT NOT NULL UNIQUE,
      position INT,
      score INT NOT NULL DEFAULT 0,
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "ranking" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "ranking', err.message);
    throw err;
  }
}

module.exports = { migrate };
