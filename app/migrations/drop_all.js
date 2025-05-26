const pool = require("../config/db.js");

/**
 * Dropa a tabela de todas as migrações.
 * @returns {Promise<void>}
 */
async function dropAll() {
  if (!pool) {
    console.error("Pool de conexão não inicializado.");
    throw new Error("Pool de conexão não inicializado.");
  }

  try {
    console.log("Iniciando drops...");

    await pool.query("BEGIN");

    await pool.query(`DROP TABLE IF EXISTS answer CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS class_user CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS question CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS test_user CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS module_user CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS class CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS merit_user CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS ranking CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS trail_user CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS certificate CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS test CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS module CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS merit CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS trail CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS "user" CASCADE`);

    await pool.query("COMMIT");
    console.log("Todas as tabelas foram removidas com sucesso.");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Erro ao dropar as tabelas:", err.message);
    throw err;
  } finally {
    if (pool) {
      await pool.end();
      console.log("Conexão com o banco de dados encerrada.");
    }
  }
}

dropAll().catch(() => {
  console.error("Falha crítica ao executar o script de drop total.");
  process.exit(1);
});
