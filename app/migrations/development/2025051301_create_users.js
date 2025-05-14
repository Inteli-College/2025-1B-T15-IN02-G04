const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS "user" (
      "id" BIGSERIAL PRIMARY KEY,
      "first_name" VARCHAR(255),
      "last_name" VARCHAR(255),
      "email" VARCHAR(255) UNIQUE NOT NULL,
      "username" VARCHAR(255) UNIQUE NOT NULL,
      "hash_password" VARCHAR(255) NOT NULL, 
      "avatar" VARCHAR(255),
      "birth_date" DATE
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "user" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "user":', err.message);
    throw err;
  }
}

module.exports = { migrate };
