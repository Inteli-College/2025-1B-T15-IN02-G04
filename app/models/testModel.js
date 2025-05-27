const db = require('../config/db');

class TestModel {
  static async getAllTests() {
    const result = await db.query('SELECT * FROM test');
    return result.rows;
  }

  static async getTestById(id) {
    const result = await db.query('SELECT * FROM test WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createTest(data) {
    const result = await db.query(
      'INSERT INTO test (name, id_trail) VALUES ($1, $2) RETURNING *',
      [data.name, data.id_trail]
    );
    return result.rows[0];
  }

  static async updateTest(id, data) {
    const result = await db.query(
      'UPDATE test SET name = $1, id_trail = $2 WHERE id = $3 RETURNING *',
      [data.name, data.id_trail, id]
    );
    return result.rows[0];
  }

  static async deleteTest(id) {
    const result = await db.query('DELETE FROM test WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = TestModel;