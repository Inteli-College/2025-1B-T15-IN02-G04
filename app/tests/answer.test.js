const AnswerController = require('../controllers/answerController');
const AnswerModel = require('../models/answerModel');

jest.mock('../models/answerModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AnswerController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllAnswers', () => {
    it('retorna todas as respostas (200)', async () => {
      const answers = [{ id: 1 }, { id: 2 }];
      AnswerModel.getAllAnswers.mockResolvedValue(answers);
      const req = {};
      const res = mockResponse();

      await AnswerController.getAllAnswers(req, res);

      expect(AnswerModel.getAllAnswers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(answers);
    });

    it('trata erro (500)', async () => {
      AnswerModel.getAllAnswers.mockRejectedValue(new Error('fail'));
      const req = {};
      const res = mockResponse();

      await AnswerController.getAllAnswers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar respostas.' });
    });
  });

  describe('getAnswerById', () => {
    it('retorna resposta específica (200)', async () => {
      const answer = { id: 1 };
      AnswerModel.getAnswerById.mockResolvedValue(answer);
      const req = { params: { id: 1 } };
      const res = mockResponse();

      await AnswerController.getAnswerById(req, res);

      expect(AnswerModel.getAnswerById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(answer);
    });

    it('retorna 404 se não encontrado', async () => {
      AnswerModel.getAnswerById.mockResolvedValue(undefined);
      const req = { params: { id: 999 } };
      const res = mockResponse();

      await AnswerController.getAnswerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resposta não encontrado' });
    });

    it('trata erro (500)', async () => {
      AnswerModel.getAnswerById.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockResponse();

      await AnswerController.getAnswerById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter resposta.' });
    });
  });

  describe('createAnswer', () => {
    it('cria resposta (201)', async () => {
      const newAnswer = { id: 1, answer_text: 'X' };
      AnswerModel.createAnswer.mockResolvedValue(newAnswer);
      const req = { body: newAnswer };
      const res = mockResponse();

      await AnswerController.createAnswer(req, res);

      expect(AnswerModel.createAnswer).toHaveBeenCalledWith(newAnswer);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newAnswer);
    });

    it('trata erro (500)', async () => {
      AnswerModel.createAnswer.mockRejectedValue(new Error('fail'));
      const req = { body: {} };
      const res = mockResponse();

      await AnswerController.createAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar resposta.' });
    });
  });

  describe('updateAnswer', () => {
    it('atualiza resposta (200)', async () => {
      const updated = { id: 1, answer_text: 'Upd' };
      AnswerModel.updateAnswer.mockResolvedValue(updated);
      const req = { params: { id: 1 }, body: { answer_text: 'Upd', correct: true, score: 10, id_question: 2 } };
      const res = mockResponse();

      await AnswerController.updateAnswer(req, res);

      expect(AnswerModel.updateAnswer).toHaveBeenCalledWith(1, 'Upd', true, 10, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('retorna 404 se não encontrado', async () => {
      AnswerModel.updateAnswer.mockResolvedValue(undefined);
      const req = { params: { id: 999 }, body: { answer_text: 'Upd' } };
      const res = mockResponse();

      await AnswerController.updateAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resposta não encontrada' });
    });

    it('trata erro (500)', async () => {
      AnswerModel.updateAnswer.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 }, body: {} };
      const res = mockResponse();

      await AnswerController.updateAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('deleteAnswer', () => {
    it('deleta resposta (200)', async () => {
      AnswerModel.deleteAnswer.mockResolvedValue(true);
      const req = { params: { id: 1 } };
      const res = mockResponse();

      await AnswerController.deleteAnswer(req, res);

      expect(AnswerModel.deleteAnswer).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Resposta deletada com sucesso' });
    });

    it('trata erro (500)', async () => {
      AnswerModel.deleteAnswer.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockResponse();

      await AnswerController.deleteAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar resposta.' });
    });
  });
});