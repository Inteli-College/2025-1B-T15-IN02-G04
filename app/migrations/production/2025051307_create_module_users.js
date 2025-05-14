const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela module_users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS module_user (
      id BIGSERIAL PRIMARY KEY,
      id_user BIGINT NOT NULL,
      id_module BIGINT NOT NULL,
      percentation INT DEFAULT 0 CHECK (percentation >= 0 AND percentation <= 100),
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (id_module) REFERENCES module(id) ON DELETE CASCADE,
      UNIQUE (id_user, id_module)
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "module_user" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "module_user":', err.message);
    throw err;
  }
}

module.exports = { migrate };
