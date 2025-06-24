const db = require('../config/db');

class CardUserModel {
  async getAll() {
    try {
      const res = await db.query('SELECT * FROM card_user');
      return res.rows;
    } catch (error) {
      console.error('Erro ao buscar relacionamentos card-user:', error);
      throw error;
    }
  }

  async getCardByUserId(id_user) {
    try {
      const res = await db.query('SELECT * FROM card_user WHERE id_user = $1', [id_user]);
      return res.rows;
    } catch (error) {
      console.error('Erro ao buscar cards do usuário:', error);
      throw error;
    }
  }

  async getUsersByCardId(id_card) {
    try {
      const res = await db.query('SELECT * FROM card_user WHERE id_card = $1', [id_card]);
      return res.rows;
    } catch (error) {
      console.error('Erro ao buscar usuários do card:', error);
      throw error;
    }
  }

  async create({ id_user, id_card }) {
    try {
      const res = await db.query(
        'INSERT INTO card_user (id_user, id_card) VALUES ($1, $2) RETURNING *',
        [id_user, id_card]
      );
      return res.rows[0];
    } catch (error) {
      console.error('Erro ao criar relacionamento card-user:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await db.query('DELETE FROM card_user WHERE id = $1', [id]);
    } catch (error) {
      console.error('Erro ao deletar relacionamento card-user:', error);
      throw error;
    }
  }

  async deleteByUserAndCard(id_user, id_card) {
    try {
      const res = await db.query(
        'DELETE FROM card_user WHERE id_user = $1 AND id_card = $2 RETURNING *',
        [id_user, id_card]
      );
      return res.rows[0];
    } catch (error) {
      console.error('Erro ao deletar relacionamento específico card-user:', error);
      throw error;
    }
  }
}

module.exports = CardUserModel;