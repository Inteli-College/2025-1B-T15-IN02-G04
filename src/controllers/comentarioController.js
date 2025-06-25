const ComentarioModel = require("../models/comentarioModel");

class ComentarioController {
  static async criar(req, res) {
    const { comment_text } = req.body;
    const { id_post } = req.params;
    const id_user = req.userId;

    if (!id_post || !comment_text) {
      return res
        .status(400)
        .json({ error: "Post e texto do comentário são obrigatórios" });
    }

    try {
      const comentario = await ComentarioModel.criarComentario({
        id_post,
        id_user,
        comment_text,
      });
      return res.status(201).json(comentario);
    } catch (err) {
      console.error("Erro ao criar comentário:", err);
      return res.status(500).json({ error: "Erro ao criar comentário" });
    }
  }

  static async listarPorPost(req, res) {
    const { id_post } = req.params;

    try {
      const comentarios = await ComentarioModel.listarPorPost(id_post);
      return res.status(200).json(comentarios);
    } catch (err) {
      console.error("Erro ao listar comentários:", err);
      return res.status(500).json({ error: "Erro ao listar comentários" });
    }
  }

  static async deletar(req, res) {
    const { id } = req.params;

    try {
      await ComentarioModel.deletarComentario(id);
      return res
        .status(200)
        .json({ message: "Comentário deletado com sucesso" });
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      return res.status(500).json({ error: "Erro ao deletar comentário" });
    }
  }
}

module.exports = ComentarioController;
