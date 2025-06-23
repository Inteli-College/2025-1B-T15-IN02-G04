require("dotenv").config();

const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const runSQLScript = async () => {
  const filePath = path.join(__dirname, "init.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  try {
    await db.pool.query(sql);
    console.log("Script SQL executado com sucesso!");
  } catch (err) {
    console.error("Erro ao executar o script SQL:", err);
  } finally {
    await db.end();
  }
};

runSQLScript();
