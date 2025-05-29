const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  findUser,
  findUserByUsername,
  createUser,
} = require("../models/userModel");
const { secret_key } = require("../config/jwtConfig");

async function register(req, res) {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const existingUser = await findUser(email);
    if (existingUser) {
      return res.status(400).json({ erro: "Email já registrado" });
    }

    let usernameBase = `${first_name}_${last_name}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
    let username = usernameBase;
    let counter = 1;

    while (await findUserByUsername(username)) {
      username = `${usernameBase}${counter}`; 
      counter++;
    }

    const saltRounds = 10;
    const hash_password = await bcrypt.hash(password, saltRounds);

    const user = await createUser(
      first_name,
      last_name,
      email,
      hash_password,
      username
    );
    if (!user) {
      return res.status(500).json({ erro: "Erro ao criar conta" });
    }

    return res
      .status(201)
      .json({ mensagem: "Sucesso ao registrar conta", username });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno do servidor", details: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }
    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.hash_password);
    if (!isPasswordValid) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, secret_key, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno do servidor", details: error.message });
  }
}

function perfilProtegido(req, res) {
  res.json({ mensagem: "Bem-vindo ao seu perfil", user: req.user });
}

module.exports = { login, register, perfilProtegido };
