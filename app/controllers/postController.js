const PostModel = require('../models/postModel');

const PostController = {
  async getAllPosts(req, res) {
    try {
      const posts = await PostModel.getAllPosts();
      return res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar posts.' });
    }
  },

  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await PostModel.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      return res.status(200).json(post);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter post.' });
    }
  },

  async createPost(req, res) {
    try {
      const newPost = await PostModel.createPost(req.body);
      return res.status(201).json(newPost);
    } catch (err) {
      console.error('Erro ao criar post:', err);
      res.status(500).json({ error: 'Erro ao criar post.' });
    }
  },

  async updatePost(req, res) {
    try {
      const updatedPost = await PostModel.updatePost(req.params.id, req.body);
      if (updatedPost) {
        res.status(200).json(updatedPost);
      } else {
        res.status(404).json({ error: 'Post não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deletePost(req, res) {
    try {
      const id = parseInt(req.params.id);
      const postDeleted = await PostModel.deletePost(id);
      if (postDeleted) {
        return res.status(200).json({ message: 'Post deletado com sucesso' });
      } else {
        return res.status(404).json({ error: 'Post não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao deletar post:', err);
      res.status(500).json({ error: 'Erro ao deletar post.' });
    }
  }
};

module.exports = PostController; 