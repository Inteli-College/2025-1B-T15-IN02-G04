const pool = require('../../config/db.js');

// Verificar conexão antes de prosseguir
if (!pool) throw new Error('Pool de conexão não inicializado.');

/**
 * Executa a migração para criar a tabela course.
 * @returns {Promise<void>}
 */
async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS course (
      id BIGINT PRIMARY KEY,
      name CHAR(100) NOT NULL,
      description CHAR(255),
      id_module BIGINT NOT NULL,
      CONSTRAINT fk_course_module FOREIGN KEY (id_module) REFERENCES module(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query('BEGIN;');
    await pool.query(query);
    await pool.query('COMMIT;');
    console.log('Tabela "course" criada com sucesso no ambiente de desenvolvimento.');
  } catch (err) {
    await pool.query('ROLLBACK;');
    console.error('Erro ao criar a tabela "course" no ambiente de desenvolvimento:', err.message);
    throw err;
  } finally {
    pool.end();
  }
}

migrate();