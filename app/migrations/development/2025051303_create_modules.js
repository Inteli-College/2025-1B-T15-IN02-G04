const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela modules.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS "module" (
      "id" BIGSERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "description" TEXT,
      "id_trail" BIGINT NOT NULL,
      FOREIGN KEY ("id_trail") REFERENCES "trail"("id") ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "module" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "module":', err.message);
    throw err;
  }
}

module.exports = { migrate };
