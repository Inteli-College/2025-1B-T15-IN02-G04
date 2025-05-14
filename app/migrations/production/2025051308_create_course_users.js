const pool = require("../../config/db.js");

// Verificar conexão antes de prosseguir
if (!pool) throw new Error("Pool de conexão não inicializado.");

/**
 * Executa a migração para criar a tabela course_users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS course_user (
      id BIGSERIAL PRIMARY KEY,
      id_user BIGINT NOT NULL,
      id_course BIGINT NOT NULL,
      complete BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (id_user) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (id_course) REFERENCES course(id) ON DELETE CASCADE,
      UNIQUE (id_user, id_course)
    );
  `;
  try {
    await pool.query("BEGIN;");
    await pool.query(query);
    await pool.query("COMMIT;");
    console.log('Tabela "course_user" criada com sucesso.');
  } catch (err) {
    await pool.query("ROLLBACK;");
    console.error('Erro ao criar a tabela "course_user":', err.message);
    throw err;
  }
}

module.exports = { migrate };
