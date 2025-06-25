jest.mock('../config/db');
const db = require('../config/db');
const ModuleModel = require('../models/moduleModel');

describe('ModuleModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllModules', () => {
    it('deve retornar todos os módulos', async () => {
      // Arrange
      const mockRows = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockRows });

      // Act
      const result = await ModuleModel.getAllModules();

      // Assert
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM module ORDER BY trail_id, order_position');
    });
  });

  describe('getModuleById', () => {
    it('deve retornar módulo por id', async () => {
      const mock = { id: 7 };
      db.query.mockResolvedValue({ rows: [mock] });
      const result = await ModuleModel.getModuleById(7);
      expect(result).toEqual(mock);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM module WHERE id = $1', [7]);
    });
  });

  describe('getModulesByTrailId', () => {
    it('deve retornar módulos de uma trilha', async () => {
      const mockRows = [{ id: 1, trail: 3 }];
      db.query.mockResolvedValue({ rows: mockRows });
      const result = await ModuleModel.getModulesByTrailId(3);
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM module WHERE Id_trail = $1 ORDER BY module_order', [3]);
    });
  });

  describe('createModule', () => {
    it('deve criar um módulo', async () => {
      const payload = { name: 'Mod', description: 'Desc', duration: '1h', trail_id: 1, order_position: 1 };
      db.query.mockResolvedValue({ rows: [{ id: 9, ...payload }] });

      const result = await ModuleModel.createModule(payload);

      expect(result).toEqual({ id: 9, ...payload });
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO module (name, description, duration, trail_id, order_position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [payload.name, payload.description, payload.duration, payload.trail_id, payload.order_position]
      );
    });
  });

  describe('updateModule', () => {
    it('deve atualizar módulo', async () => {
      const updated = { id: 4, name: 'Novo', description: 'D', duration: '2h', order_position: 3 };
      db.query.mockResolvedValue({ rows: [updated] });
      const result = await ModuleModel.updateModule(updated.id, updated.name, updated.description, updated.duration, updated.order_position);
      expect(result).toEqual(updated);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE module SET name = $1, description = $2, duration = $3, order_position = $4 WHERE id = $5 RETURNING *',
        [updated.name, updated.description, updated.duration, updated.order_position, updated.id]
      );
    });
  });

  describe('deleteModule', () => {
    it('deve retornar true quando deletar', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });
      const result = await ModuleModel.deleteModule(2);
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM module WHERE id = $1 RETURNING *', [2]);
    });
  });
}); 