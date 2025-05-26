// controllers necessários para o login
const jwt = require('jsonwebtoken');
const { findUser } = require('../models/userModel');
const { secret_key } = require('../config/jwtConfig');

// Função para autenticar o usuário
function login(req, res) {
    const {email, password} = req.body;
    const user = findUser(email, password)

    if(!user) return res.status(401).jason({erro: "Email ou senha inválidos"});

    // Criação do token vitalício
    const token = jwt.sign({ id: user.id, email: user.email }, secret_key);
    res.json({ token });
}

function perfilProtegido(req, res) {
    res.json({ message: 'Bem vindo' });
}

module.exports = { login, perfilProtegido };
