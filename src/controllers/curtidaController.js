const CurtidaModel = require("../models/curtidaModel");

class CurtidaController {
  static async curtir(req, res) {
    const id_user = req.userId;
    const { id_post } = req.params;

    if (!id_post) {
      return res.status(400).json({ error: "ID do post é obrigatório" });
    }

    try {
      await CurtidaModel.curtirPost(id_user, id_post);
      return res.status(201).json({ message: "Post curtido com sucesso" });
    } catch (err) {
      console.error("Erro ao curtir post:", err);
      return res.status(500).json({ error: "Erro ao curtir post" });
    }
  }

  static async descurtir(req, res) {
    const id_user = req.userId;
    const { id_post } = req.params;

    if (!id_post) {
      return res.status(400).json({ error: "ID do post é obrigatório" });
    }

    try {
      await CurtidaModel.descurtirPost(id_user, id_post);
      return res.status(200).json({ message: "Curtida removida com sucesso" });
    } catch (err) {
      console.error("Erro ao remover curtida:", err);
      return res.status(500).json({ error: "Erro ao remover curtida" });
    }
  }

  static async contar(req, res) {
    const { id_post } = req.params;

    try {
      const total = await CurtidaModel.contarCurtidas(id_post);
      return res.status(200).json({ total });
    } catch (err) {
      console.error("Erro ao contar curtidas:", err);
      return res.status(500).json({ error: "Erro ao contar curtidas" });
    }
  }

  static async verificar(req, res) {
    const id_user = req.userId;
    const { id_post } = req.params;

    try {
      const curtiu = await CurtidaModel.verificarSeUsuarioCurtiu(
        id_user,
        id_post
      );
      return res.status(200).json({ curtiu });
    } catch (err) {
      console.error("Erro ao verificar curtida:", err);
      return res.status(500).json({ error: "Erro ao verificar curtida" });
    }
  }
}

module.exports = CurtidaController;
