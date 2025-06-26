const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (
    req.path === "/dashboard" ||
    req.path === "/me" ||
    req.path.startsWith("/perfil") ||
    req.path.startsWith("/feed") ||
    req.path.startsWith("/cards")
  ) {
    if (!token) {
      console.log("No token found, redirecting to /login");
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      return next();
    } catch (err) {
      console.error("Erro ao verificar token:", err);
      res.clearCookie("token");
      return res.redirect("/login");
    }
  }

  // Para outras rotas, verificar se há token válido e definir userId se houver
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (err) {
      console.error("Token inválido:", err);
      res.clearCookie("token");
    }
  }

  // Para login, redirecionar para dashboard se já estiver logado
  if (req.path === "/login" && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("Erro ao verificar token:", err);
      res.clearCookie("token");
    }
  }

  return next();
};

/**
 * Middleware para restringir rota a usuários com role_id = 2 (Gestor)
 */
const onlyGestor = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const roles = await UserModel.buscarRolesPorUsuario(req.userId);
    const isGestor = roles.some((r) => parseInt(r.id_role) === 2);

    if (!isGestor) {
      return res
        .status(403)
        .json({ error: "Acesso restrito a usuários Gestor" });
    }
    next();
  } catch (err) {
    console.error("Erro no onlyGestor:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * Middleware para restringir rota a usuários com role_id = 1 (Admin)
 */
const onlyAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const roles = await UserModel.buscarRolesPorUsuario(req.userId);
    const isAdmin = roles.some((r) => parseInt(r.id_role) === 1);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Acesso restrito a usuários Administradores" });
    }
    next();
  } catch (err) {
    console.error("Erro no onlyAdmin:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = checkAuth;
// mantendo exportações adicionais para uso avançado
module.exports.ensureAuth = checkAuth;
module.exports.onlyGestor = onlyGestor;
module.exports.onlyAdmin = onlyAdmin;
