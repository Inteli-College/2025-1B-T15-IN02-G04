const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela trail_users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS trail_user (
      id BIGSERIAL PRIMARY KEY,
      id_user BIGINT NOT NULL,
      id_trail BIGINT NOT NULL,
      percentation INT DEFAULT 0 CHECK (percentation >= 0 AND percentation <= 100),
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE,
      UNIQUE (id_user, id_trail)
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "trail_user" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "trail_user":', err.message);
    throw err;
  }
}

module.exports = { migrate };
