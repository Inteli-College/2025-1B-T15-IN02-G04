const migrateMerits = require('./2025050801_create_merits');
const migrateUsers = require('./2025050802_create_users');
const migrateMeritsUsers = require('./2025050803_create_merits_users');
const migrateRanking = require('./2025050804_create_ranking');
const migrateTrail = require('./2025050805_create_trail');
const migrateCertificate = require('./2025050806_create_certificate');
const migrateModule = require('./2025050807_create_module');
const migrateCourse = require('./2025050808_create_course');
const migrateQuestion = require('./2025050809_create_question');
const migrateAnswer = require('./2025050810_create_answer');

/**
 * Executa todas as migrações na ordem correta.
 * @returns {Promise<void>}
 */
async function migrateAll() {
  try {
    await migrateMerits.migrate();
    await migrateUsers.migrate();
    await migrateMeritsUsers.migrate();
    await migrateRanking.migrate();
    await migrateTrail.migrate();
    await migrateCertificate.migrate();
    await migrateModule.migrate();
    await migrateCourse.migrate();
    await migrateQuestion.migrate();
    await migrateAnswer.migrate();
    console.log(
          "Todas as tabelas foram criadas com sucesso no ambiente de produção."
        );
      } catch (err) {
        console.error(
          "Erro ao executar as migrações no ambiente de produção:",
          err.message
        );
        throw err;
      } finally {
        await pool.end();
        console.log("Conexão com o banco de dados encerrada.");
      }
    }
    
    migrateAll();