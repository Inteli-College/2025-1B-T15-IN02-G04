// controllers/userController.js

const userController = require("../models/userModel");

const UserController = {
  async getAllUsers(req, res) {
    try {
      const users = await UserModels.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModels.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao obter usuário." });
    }
  },

  async createUser(req, res) {
    try {
      const newUser = await UserModels.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  },

  async updateUser(req, res) {
    try {
      const { first_name, last_name, email, hash_password, username } =
        req.body;
      console.log("REQ.BODY:", req.body);
      console.log("FIRST_NAME:", first_name);
      console.log("LAST_NAME:", last_name);
      console.log("EMAIL:", email);
      console.log("HASH_PASSWORD:", hash_password);
      console.log("USERNAME:", username);
      const updatedUser = await UserModels.updateUser(
        req.params.id,
        first_name,
        last_name,
        email,
        hash_password,
        username
      );
      if (updatedUser) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ error: "Usuário não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const deletedUser = await userModels.deleteUser(req.params.id);
      if (deletedUser) {
        res.status(200).json(deletedUser);
      } else {
        res.status(404).json({ error: "Usuário não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = UserController;
