const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela certificate.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS certificate (
      id BIGINT PRIMARY KEY,
      description VARCHAR(255),
      date DATE NOT NULL,
      id_user BIGINT NOT NULL,
      CONSTRAINT fk_certificate_user FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "certificate" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "certificate" no ambiente de desenvolvimento:', err.message);
    throw err;
  }
}

module.exports = { migrate };