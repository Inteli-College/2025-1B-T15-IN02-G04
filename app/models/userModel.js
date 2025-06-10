const db = require("../config/db");

class User {
  static async getAll() {
    try {
      const result = await db.query('SELECT id, first_name, last_name, email, username, avatar, birth_date FROM "user"');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT id, first_name, last_name, email, username, avatar, birth_date FROM "user" WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw error;
    }
  }

  static async createUser(first_name, last_name, email, hash_password, username) {
    try {
      console.log("Criando usuário com dados:", { first_name, last_name, email, username });
      
      const result = await db.query(
        'INSERT INTO "user" (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, username',
        [first_name, last_name, email, hash_password, username]
      );
      
      console.log("Usuário criado no banco:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const result = await db.query(
        'UPDATE "user" SET first_name = $1, last_name = $2, email = $3, username = $4 WHERE id = $5 RETURNING id, first_name, last_name, email, username',
        [data.first_name, data.last_name, data.email, data.username, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM "user" WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  }

  static async findUser(email) {
    try {
      const result = await db.query('SELECT * FROM "user" WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      throw error;
    }
  }

  static async findUserByUsername(username) {
    try {
      const result = await db.query('SELECT * FROM "user" WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar usuário por username:", error);
      throw error;
    }
  }
}

module.exports = {
  findUser: User.findUser,
  createUser: User.createUser,
  findUserByUsername: User.findUserByUsername,
  getAllUsers: User.getAll,
  getUserById: User.getById,
  updateUser: User.update,
  deleteUser: User.delete
};