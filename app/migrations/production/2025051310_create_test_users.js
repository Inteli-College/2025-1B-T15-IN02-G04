const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela test_users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS test_user (
      id BIGSERIAL PRIMARY KEY,
      id_user BIGINT NOT NULL,
      id_test BIGINT NOT NULL,
      grade INT CHECK (grade >= 0 AND grade <= 100),
      submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (id_test) REFERENCES test(id) ON DELETE CASCADE,
      UNIQUE (id_user, id_test)
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "test_user" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "test_users"', err.message);
    throw err;
  }
}

module.exports = { migrate };
