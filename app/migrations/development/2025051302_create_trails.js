const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela trails.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS "trail" (
      "id" BIGSERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "description" TEXT
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "trail" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "trail":', err.message);
    throw err;
  }
}

module.exports = { migrate };
