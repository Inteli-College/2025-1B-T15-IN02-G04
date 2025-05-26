const pool = require("../config/db.js");

const migrateUsers = require("./production/2025051301_create_users.js");
const migrateTrails = require("./production/2025051302_create_trails.js");
const migrateMerits = require("./production/2025051313_create_merits.js");
const migrateModules = require("./production/2025051303_create_modules.js");
const migrateTests = require("./production/2025051309_create_tests.js");
const migrateClasss = require("./production/2025051304_create_classs.js");
const migrateCertificates = require("./production/2025051305_create_certificates.js");
const migrateTrailUsers = require("./production/2025051306_create_trail_users.js");
const migrateRankings = require("./production/2025051315_create_rankings.js");
const migrateMeritUsers = require("./production/2025051314_create_merit_users.js");
const migrateModuleUsers = require("./production/2025051307_create_module_users.js");
const migrateTestUsers = require("./production/2025051310_create_test_users.js");
const migrateQuestions = require("./production/2025051311_create_questions.js");
const migrateClassUsers = require("./production/2025051308_create_class_users.js");
const migrateAnswers = require("./production/2025051312_create_answers.js");

/**
 * Executa todas as migrações na ordem correta de dependência.
 * @returns {Promise<void>}
 */
async function migrateAll() {
  if (!pool) {
    console.error(
      "Pool de conexão não inicializado. Migrações não podem ser executadas."
    );
    throw new Error("Pool de conexão não inicializado.");
  }

  try {
    console.log("Iniciando migrações...");
    await migrateUsers.migrate();
    await migrateTrails.migrate();
    await migrateMerits.migrate();
    await migrateModules.migrate();
    await migrateTests.migrate();
    await migrateCertificates.migrate();
    await migrateTrailUsers.migrate();
    await migrateRankings.migrate();
    await migrateMeritUsers.migrate();
    await migrateClass.migrate();
    await migrateModuleUsers.migrate();
    await migrateTestUsers.migrate();
    await migrateQuestions.migrate();
    await migrateClassUsers.migrate();
    await migrateAnswers.migrate();

    console.log("Todas as migrações foram executadas com sucesso.");
  } catch (err) {
    console.error("Erro ao executar as migrações:", err.message, err.stack);

    throw err;
  } finally {
    if (pool) {
      await pool.end();
      console.log("Conexão com o banco de dados encerrada.");
    }
  }
}

migrateAll().catch((error) => {
  console.error("Falha crítica ao executar o script de migração total.");
  process.exit(1);
});
