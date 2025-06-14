const MeritController = require('../controllers/meritController');
const MeritModel = require('../models/meritModel');

jest.mock('../models/meritModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('MeritController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllMerits', () => {
    it('200', async () => {
      const list = [{ id: 1 }];
      MeritModel.getAllMerits.mockResolvedValue(list);
      const res = mockResponse();
      await MeritController.getAllMerits({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(list);
    });
    it('500', async () => {
      MeritModel.getAllMerits.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await MeritController.getAllMerits({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar méritos.' });
    });
  });

  describe('getMeritById', () => {
    it('200', async () => {
      const data = { id: 1 };
      MeritModel.getMeritById.mockResolvedValue(data);
      const res = mockResponse();
      await MeritController.getMeritById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('404', async () => {
      MeritModel.getMeritById.mockResolvedValue(undefined);
      const res = mockResponse();
      await MeritController.getMeritById({ params: { id: 99 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Mérito não encontrado' });
    });
    it('500', async () => {
      MeritModel.getMeritById.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await MeritController.getMeritById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter mérito.' });
    });
  });

  describe('createMerit', () => {
    it('201', async () => {
      const payload = { name: 'M' };
      const created = { id: 1, ...payload };
      MeritModel.createMerit.mockResolvedValue(created);
      const res = mockResponse();
      await MeritController.createMerit({ body: payload }, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
    it('500', async () => {
      MeritModel.createMerit.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await MeritController.createMerit({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar mérito' });
    });
  });

  describe('updateMerit', () => {
    it('200', async () => {
      const upd = { id: 1 };
      MeritModel.updateMerit.mockResolvedValue(upd);
      const req = { params: { id: 1 }, body: { name: 'U', description: 'd' } };
      const res = mockResponse();
      await MeritController.updateMerit(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('404', async () => {
      MeritModel.updateMerit.mockResolvedValue(undefined);
      const res = mockResponse();
      await MeritController.updateMerit({ params: { id: 99 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Mérito não encontrado' });
    });
    it('500', async () => {
      MeritModel.updateMerit.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await MeritController.updateMerit({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('deleteMerit', () => {
    it('200', async () => {
      MeritModel.deleteMerit.mockResolvedValue(true);
      const res = mockResponse();
      await MeritController.deleteMerit({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mérito deletado com sucesso' });
    });
    it('500', async () => {
      MeritModel.deleteMerit.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await MeritController.deleteMerit({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar mérito' });
    });
  });
});