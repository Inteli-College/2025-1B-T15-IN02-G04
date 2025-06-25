require("dotenv").config();

const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const routes = require("./src/routes/allRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.set("layout", path.join(__dirname, "src/views/layout/main"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.json());
app.use(cookieParser());

app.use("/", routes);


// app.use((req, res, next) => {
//   res.status(404).render("404", { message: "Página não encontrada" });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res
//     .status(500)
//     .render("pages/error", { message: "Erro interno do servidor" });
// });


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
