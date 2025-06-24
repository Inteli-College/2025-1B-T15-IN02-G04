const pool = require('../config/db');

class CardUserModel {
  async getAll() {
    const res = await pool.query('SELECT * FROM card_user');
    return res.rows;
      } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }

  async getCardByUserId(id_card) {
    const res = await pool.query('SELECT * FROM card_user WHERE id_card = $1', [id_card]);
    return res.rows[0];
      } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }

  async create({ id_user, id_card }) {
    const res = await pool.query(
      'INSERT INTO card_user (id_user, id_card) VALUES ($1, $2) RETURNING *',
      [id_user, id_card]
    );
    return res.rows[0];
      } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }

  async delete(id) {
    await pool.query('DELETE FROM card_user WHERE id = $1', [id]);
      } catch (error) {
      console.error('Erro ao buscar card:', error);
      throw error;
  }
};

module.exports = CardUserModel;