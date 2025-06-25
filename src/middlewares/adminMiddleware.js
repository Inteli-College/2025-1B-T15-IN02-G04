const UserModel = require("../models/userModel");

const checkAdminAuth = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Buscar roles do usuário
    const roles = await UserModel.buscarRolesPorUsuario(userId);
    const isAdmin = roles.some(role => role.id_role === 1);

    if (!isAdmin) {
      return res.status(403).json({ error: "Acesso negado. Permissões administrativas necessárias." });
    }

    req.userRoles = roles;
    req.isAdmin = true;
    return next();
  } catch (err) {
    console.error("Erro ao verificar permissões de admin:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = checkAdminAuth;