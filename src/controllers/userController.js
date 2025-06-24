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
      const usuario = await UserModel.buscarPorId(idUsuario);

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json(usuario);
    } catch (err) {
      console.error("Erro ao buscar perfil do usuário:", err);
      return res.status(500).json({ error: "Erro ao buscar perfil do usuário" });
    }
  }

  static async obterUsuario(req, res) {
    const { id } = req.params;
    try {
      const usuario = await UserModel.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.status(200).json(usuario);
    } catch (err) {
      console.error("Erro ao buscar usuário por ID:", err);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }
}

module.exports = UserController
