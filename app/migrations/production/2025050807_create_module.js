const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela module.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS module (
      id BIGINT PRIMARY KEY,
      name CHAR(100) NOT NULL,
      description CHAR(255),
      id_trail BIGINT NOT NULL,
      CONSTRAINT fk_module_trail FOREIGN KEY (id_trail) REFERENCES trail(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "module" criada com sucesso no ambiente de produção.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "module" no ambiente de produção:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();