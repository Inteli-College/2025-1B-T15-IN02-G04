const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela courses.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS course (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      id_module BIGINT NOT NULL,
      FOREIGN KEY (id_module) REFERENCES module(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "course" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "course":', err.message);
    throw err;
  }
}

module.exports = { migrate };
