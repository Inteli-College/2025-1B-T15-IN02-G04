const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela certificates.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS certificate (
      id BIGSERIAL PRIMARY KEY,
      description TEXT,
      date DATE NOT NULL,
      id_user BIGINT NOT NULL,
      id_trail BIGINT NOT NULL,
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "certificate" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "certificate":', err.message);
    throw err;
  }
}

module.exports = { migrate };
