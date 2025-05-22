// Middleware para autenticação de usuários
const jwt = require('jsonwebtoken');
const { secret_key } = require('../config/jwtConfig');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    try {
        const decoded = jwt.verify(token, secret_key);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ erro: 'Token inválido' });
    }
}

mpdule.exports = authMiddleware;