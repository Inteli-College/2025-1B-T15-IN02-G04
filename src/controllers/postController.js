const PostModel = require("../models/postModel");

class PostController {
  static async criar(req, res) {
    const { titulo, descricao, imagem } = req.body;
    const id_user = req.userId; // Campo compatível com model/schema

    if (!titulo || !descricao) {
      return res
        .status(400)
        .json({ error: "Título e descrição são obrigatórios" });
    }

    try {
      const post = await PostModel.criarPost({
        id_user,
        titulo,
        descricao,
        imagem,
      });
      return res.status(201).json(post);
    } catch (err) {
      console.error("Erro ao criar post:", err);
      return res.status(500).json({ error: "Erro ao criar post" });
    }
  }

  static async listar(req, res) {
    try {
      const posts = await PostModel.listarTodos();
      return res.status(200).json(posts);
    } catch (err) {
      console.error("Erro ao listar posts:", err);
      return res.status(500).json({ error: "Erro ao listar posts" });
    }
  }

  static async buscarPorId(req, res) {
    const { id } = req.params;

    try {
      const post = await PostModel.buscarPorId(id);

      if (!post) {
        return res.status(404).json({ error: "Post não encontrado" });
      }

      return res.status(200).json(post);
    } catch (err) {
      console.error("Erro ao buscar post:", err);
      return res.status(500).json({ error: "Erro ao buscar post" });
    }
  }

  static async deletar(req, res) {
    const { id } = req.params;

    try {
      await PostModel.deletarPost(id);
      return res.status(200).json({ message: "Post deletado com sucesso" });
    } catch (err) {
      console.error("Erro ao deletar post:", err);
      return res.status(500).json({ error: "Erro ao deletar post" });
    }
  }
}

module.exports = PostController;
