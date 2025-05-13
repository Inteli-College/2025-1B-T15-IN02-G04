const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela tests.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS test (
      id BIGSERIAL PRIMARY KEY,
      id_trail BIGINT NOT NULL,
      name VARCHAR(255),
      FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "test" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "test"', err.message);
    throw err;
  }
}

module.exports = { migrate };
