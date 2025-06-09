const db = require('../config/db');

class CardModel {
  static async getAllCards() {
    const result = await db.query('SELECT * FROM card');
    return result.rows;
  }

  static async getCardById(id) {
    const result = await db.query('SELECT * FROM card WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createCard(data) {
    const result = await db.query(
      'INSERT INTO card (title, description, image) VALUES ($1, $2) RETURNING *',
      [data.name, data.description]
    );
    return result.rows[0];
  }

  static async updateCard(id, name, description) {
    const result = await db.query( 'UPDATE card SET title = $1, description = $2, image = $3 WHERE id = $3 RETURNING *',
    [name, description, id]
    );
    return result.rows[0];
  }

  static async deleteCard(id) {
    const result = await db.query('DELETE FROM card WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = CardModel;