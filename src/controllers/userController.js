const UserModel = require("../models/userModel");

class UserController {
  static async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    try {
      const resultado = await UserModel.verificarCredenciais(email, senha);

      if (resultado.error) {
        return res.status(401).json({ error: resultado.error });
      }

      return res.status(200).json({ user: resultado.user });
    } catch (err) {
      return res.status(500).json({ error: "Erro no login" });
    }
  }

  static async listarRanking(req, res) {
    try {
      const usuarios = await UserModel.listarUsuariosPorScore();
      return res.status(200).json(usuarios);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar ranking de usuários" });
    }
  }

  static async meuPerfil(req, res) {
    const idUsuario = req.userId;

    try {
      console.log('🔍 [DEBUG] Buscando perfil para userId:', idUsuario);
      
      const usuario = await UserModel.buscarPorId(idUsuario);

      if (!usuario) {
        console.log('❌ [DEBUG] Usuário não encontrado:', idUsuario);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      console.log('✅ [DEBUG] Usuário encontrado:', {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email
      });

      // Buscar roles do usuário
      console.log('🔍 [DEBUG] Buscando roles para usuário:', idUsuario);
      const roles = await UserModel.buscarRolesPorUsuario(idUsuario);
      console.log('📋 [DEBUG] Roles encontradas:', roles);
      
      usuario.roles = roles;
      usuario.isAdmin = roles.some(role => {
        console.log('🔍 [DEBUG] Verificando role:', role.id_role, 'É admin?', role.id_role === 1);
        return role.id_role === 1;
      });

      console.log('👑 [DEBUG] É admin?', usuario.isAdmin);
      console.log('📤 [DEBUG] Resposta final:', {
        id: usuario.id,
        name: usuario.name,
        isAdmin: usuario.isAdmin,
        rolesCount: roles.length
      });

      return res.status(200).json(usuario);
    } catch (err) {
      console.error("❌ [DEBUG] Erro ao buscar perfil do usuário:", err);
      return res.status(500).json({ error: "Erro ao buscar perfil do usuário" });
    }
  }

  static async obterUsuario(req, res) {
    const { id } = req.params;
    try {
      console.log('🔍 [DEBUG] Buscando usuário por ID:', id);
      
      const usuario = await UserModel.buscarPorId(id);
      if (!usuario) {
        console.log('❌ [DEBUG] Usuário não encontrado:', id);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Buscar roles do usuário
      const roles = await UserModel.buscarRolesPorUsuario(id);
      console.log('📋 [DEBUG] Roles para usuário', id, ':', roles);
      
      usuario.roles = roles;
      usuario.isAdmin = roles.some(role => role.id_role === 1);

      console.log('👑 [DEBUG] Usuário', id, 'é admin?', usuario.isAdmin);

      return res.status(200).json(usuario);
    } catch (err) {
      console.error("❌ [DEBUG] Erro ao buscar usuário por ID:", err);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }
}

module.exports = UserController