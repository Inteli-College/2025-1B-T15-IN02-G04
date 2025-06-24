require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const UserModel = require("../models/userModel");

const register = async (req, res) => {
  const { name, email, username, password , id_role } = req.body;

  try {
    const saltRounds = 10;
    const hashSenha = await bcrypt.hash(password, saltRounds);

    await db.query(
      'INSERT INTO "user" (name, email, username, password) VALUES ($1, $2, $3, $4)',
      [name, email, username, hashSenha]
    );
    
    await db.query(
      'INSERT INTO role_user (id_user, id_role) VALUES ((SELECT id FROM "user" WHERE email = $1), $2)',
      [email, id_role]
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
      { id: user.id, email: user.email },
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
        nome: user.name,
        email: user.email,
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