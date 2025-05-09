const pool = require('../../config/db.js')

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela merits_users.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS merits_users (
      id_user BIGINT NOT NULL,
      id_merit BIGINT NOT NULL,
      PRIMARY KEY (id_user, id_merit),
      CONSTRAINT fk_merits_users_user FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_merits_users_merit FOREIGN KEY (id_merit) REFERENCES merits(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "merits_users" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "merits_users" no ambiente de desenvolvimento:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();