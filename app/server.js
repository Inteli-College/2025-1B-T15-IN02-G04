require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const indexRoutes = require("./routes/indexRoutes");
const db = require("./config/db");

const PORT = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a pasta pública com CSS e outros arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use(indexRoutes);

// Middleware para lidar com erros de rota não encontrada
app.use((req, res, next) => {
  res.status(404).send("Página não encontrada");
});

// Middleware para lidar com erros internos do servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Erro no servidor");
});

db.connect()
  .then(() => {
    console.log("Conectado ao banco de dados PostgreSQL");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados:", err);
  });


