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
    console.log("Dados recebidos:", req.body); // Log para debug
    
    const { first_name, last_name, email, password } = req.body;
    
    // Validação básica
    if (!first_name || !last_name || !email || !password) {
      console.log("Campos obrigatórios faltando");
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    // Verificar se email já existe
    const existingUser = await findUser(email);
    if (existingUser) {
      console.log("Email já existe:", email);
      return res.status(400).json({ erro: "Email já registrado" });
    }

    // Gerar username único
    let usernameBase = `${first_name}_${last_name}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .replace(/\s+/g, "_");
    
    let username = usernameBase;
    let counter = 1;

    while (await findUserByUsername(username)) {
      username = `${usernameBase}${counter}`; 
      counter++;
    }

    console.log("Username gerado:", username);

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário (passando a senha hasheada para o parâmetro correto)
    const user = await createUser(
      first_name,
      last_name,
      email,
      hashedPassword, // Este valor irá para a coluna 'password' no banco
      username
    );

    if (!user) {
      console.log("Erro ao criar usuário no banco");
      return res.status(500).json({ erro: "Erro ao criar conta" });
    }

    console.log("Usuário criado com sucesso:", user.id);

    return res.status(201).json({ 
      mensagem: "Sucesso ao registrar conta", 
      username: user.username,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ 
      erro: "Erro interno do servidor", 
      details: error.message 
    });
  }
}

async function login(req, res) {
  try {
    console.log("Tentativa de login:", req.body.email); // Log para debug
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }
    
    const user = await findUser(email);
    if (!user) {
      console.log("Usuário não encontrado:", email);
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    
    // Usar user.password em vez de user.hash_password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Senha inválida para:", email);
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username 
      }, 
      secret_key, 
      { expiresIn: "24h" }
    );
    
    console.log("Login bem-sucedido:", email);
    
    res.json({ 
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ 
      erro: "Erro interno do servidor", 
      details: error.message 
    });
  }
}

function perfilProtegido(req, res) {
  res.json({ mensagem: "Bem-vindo ao seu perfil", user: req.user });
}

module.exports = { login, register, perfilProtegido };