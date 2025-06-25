require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const UserModel = require("../models/userModel");

const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const saltRounds = 10;
    const hashSenha = await bcrypt.hash(senha, saltRounds);

    await db.query(
      "INSERT INTO Usuario (nome, email, hash_senha, tipo) VALUES ($1, $2, $3, $4)",
      [nome, email, hashSenha, "PTD"]
    );

    res.redirect("/login");
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const resultado = await UserModel.verificarCredenciais(email, senha);

    if (resultado.error) {
      return res.status(401).json({ error: resultado.error });
    }

    const user = resultado.user;

    // Geração do token JWT
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    // Send user data
    return res.status(200).json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });

  // Redirect to login page
  res.redirect("/login");
};

module.exports = { login, register, logout };