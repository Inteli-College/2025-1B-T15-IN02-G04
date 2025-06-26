const db = require("../config/db");

class CardModel {
  static async getAllCards() {
    try {
      const result = await db.query(
        "SELECT * FROM card ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar cards:", error);
      throw error;
    }
  }

  static async getCardById(id) {
    try {
      const result = await db.query("SELECT * FROM card WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar card:", error);
      throw error;
    }
  }

  static async getCardByTitle(title) {
    try {
      const result = await db.query("SELECT * FROM card WHERE title ILIKE $1", [
        `%${title}%`,
      ]);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar card:", error);
      throw error;
    }
  }

  static async createCard(data) {
    try {
      const result = await db.query(
        "INSERT INTO card (title, description, image) VALUES ($1, $2, $3) RETURNING *",
        [data.title, data.description, data.image]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar card:", error);
      throw error;
    }
  }

  static async updateCard(id, title, description, image) {
    try {
      const result = await db.query(
        "UPDATE card SET title = $1, description = $2, image = $3 WHERE id = $4 RETURNING *",
        [title, description, image, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
      throw error;
    }
  }

  static async deleteCard(id) {
    try {
      const result = await db.query(
        "DELETE FROM card WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar card:", error);
      throw error;
    }
  }

  static async favoriteCard(userId, cardId) {
    try {
      // Primeiro, verifica se já existe o relacionamento
      const existing = await db.query(
        "SELECT * FROM card_user WHERE id_user = $1 AND id_card = $2",
        [userId, cardId]
      );

      if (existing.rows.length > 0) {
        // Se já existe, apenas retorna
        return existing.rows[0];
      }

      // Se não existe, cria o relacionamento
      const result = await db.query(
        "INSERT INTO card_user (id_user, id_card) VALUES ($1, $2) RETURNING *",
        [userId, cardId]
      );

      // Atualiza o campo fav do card para true
      await db.query("UPDATE card SET fav = true WHERE id = $1", [cardId]);

      return result.rows[0];
    } catch (error) {
      console.error("Erro ao favoritar card:", error);
      throw error;
    }
  }

  static async unfavoriteCard(userId, cardId) {
    try {
      // Remove o relacionamento
      const result = await db.query(
        "DELETE FROM card_user WHERE id_user = $1 AND id_card = $2 RETURNING *",
        [userId, cardId]
      );

      // Verifica se ainda existem outros usuários com este card favoritado
      const otherUsers = await db.query(
        "SELECT COUNT(*) as count FROM card_user WHERE id_card = $1",
        [cardId]
      );

      // Se não há outros usuários, marca o card como não favoritado
      if (parseInt(otherUsers.rows[0].count) === 0) {
        await db.query("UPDATE card SET fav = false WHERE id = $1", [cardId]);
      }

      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao desfavoritar card:", error);
      throw error;
    }
  }

  static async getUserFavoriteCards(userId) {
    try {
      const result = await db.query(
        `
        SELECT c.*, cu.obtained_at as favorited_at 
        FROM card c 
        INNER JOIN card_user cu ON c.id = cu.id_card 
        WHERE cu.id_user = $1 
        ORDER BY cu.obtained_at DESC
      `,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar cards favoritos:", error);
      throw error;
    }
  }

  static async isCardFavoritedByUser(userId, cardId) {
    try {
      const result = await db.query(
        "SELECT * FROM card_user WHERE id_user = $1 AND id_card = $2",
        [userId, cardId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Erro ao verificar se card é favorito:", error);
      throw error;
    }
  }

  static async searchCards(searchTerm) {
    try {
      const result = await db.query(
        `
        SELECT * FROM card 
        WHERE title ILIKE $1 OR description ILIKE $1 
        ORDER BY created_at DESC
      `,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao pesquisar cards:", error);
      throw error;
    }
  }
}

module.exports = CardModel;
