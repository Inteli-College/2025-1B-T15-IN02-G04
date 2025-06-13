const CertificateController = require('../controllers/certificateController');
const CertificateModel = require('../models/certificateModel');

jest.mock('../models/certificateModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CertificateController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllCertificates', () => {
    it('retorna todos os certificados (200)', async () => {
      const data = [{ id: 1 }];
      CertificateModel.getAllCertificates.mockResolvedValue(data);
      const res = mockResponse();
      await CertificateController.getAllCertificates({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('erro (500)', async () => {
      CertificateModel.getAllCertificates.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await CertificateController.getAllCertificates({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar certificados.' });
    });
  });

  describe('getCertificateById', () => {
    it('retorna certificado (200)', async () => {
      const cert = { id: 1 };
      CertificateModel.getCertificateById.mockResolvedValue(cert);
      const req = { params: { id: 1 } };
      const res = mockResponse();
      await CertificateController.getCertificateById(req, res);
      expect(CertificateModel.getCertificateById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(cert);
    });

    it('404 se não encontrado', async () => {
      CertificateModel.getCertificateById.mockResolvedValue(undefined);
      const req = { params: { id: 99 } };
      const res = mockResponse();
      await CertificateController.getCertificateById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Certificado não encontrado' });
    });

    it('erro (500)', async () => {
      CertificateModel.getCertificateById.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 } };
      const res = mockResponse();
      await CertificateController.getCertificateById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter certificado.' });
    });
  });

  describe('createCertificate', () => {
    it('cria certificado (201)', async () => {
      const payload = { name: 'Cert' };
      const created = { id: 1, ...payload };
      CertificateModel.createCertificate.mockResolvedValue(created);
      const req = { body: payload };
      const res = mockResponse();
      await CertificateController.createCertificate(req, res);
      expect(CertificateModel.createCertificate).toHaveBeenCalledWith(payload);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('erro (500)', async () => {
      CertificateModel.createCertificate.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await CertificateController.createCertificate({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar certificado.' });
    });
  });

  describe('updateCertificate', () => {
    it('atualiza certificado (200)', async () => {
      const updated = { id: 1, name: 'Upd' };
      CertificateModel.updateCertificate.mockResolvedValue(updated);
      const req = { params: { id: 1 }, body: { name: 'Upd', description: 'd', date:'2020', user_id:1, trail_id:1 } };
      const res = mockResponse();
      await CertificateController.updateCertificate(req, res);
      expect(CertificateModel.updateCertificate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('404 se não encontrado', async () => {
      CertificateModel.updateCertificate.mockResolvedValue(undefined);
      const req = { params: { id: 99 }, body: {} };
      const res = mockResponse();
      await CertificateController.updateCertificate(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Certificado não encontrado' });
    });

    it('erro (500)', async () => {
      CertificateModel.updateCertificate.mockRejectedValue(new Error('fail'));
      const req = { params: { id: 1 }, body: {} };
      const res = mockResponse();
      await CertificateController.updateCertificate(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('deleteCertificate', () => {
    it('deleta certificado (200)', async () => {
      CertificateModel.deleteCertificate.mockResolvedValue(true);
      const req = { params: { id: 1 } };
      const res = mockResponse();
      await CertificateController.deleteCertificate(req, res);
      expect(CertificateModel.deleteCertificate).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Certficado deletado com sucesso' });
    });

    it('erro (500)', async () => {
      CertificateModel.deleteCertificate.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await CertificateController.deleteCertificate({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar certificado' });
    });
  });
}); 