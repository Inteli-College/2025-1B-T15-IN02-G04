const CertificateModel = require('../models/certificateModel');

const CertificateController = {

  async getAllCertificates(req, res) {
    try {
      const certificates = await CertificateModel.getAllCertificates();
      return res.status(200).json(certificates);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar certificados.' });
    }
  },

  async getCertificateById(req, res) {
    try {
      const { id } = req.params;
      const certificate = await CertificateModel.getCertificateById(id);
      if (!certificate) {
        return res.status(404).json({ error: 'Certificado não encontrado' });
      }
      return res.status(200).json(certificate);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter certificado.' });
    }
  },

  async createCertificate(req, res) {
    try {
      const newCertificate = await CertificateModel.createCertificate(req.body);
      return res.status(201).json(newCertificate);
      } catch (err) {
        console.error('Erro ao criar certificado:', err); 
        res.status(500).json({ error: 'Erro ao criar certificado.' });
      }
  },

      async updateCertificate(req, res) {
      try {
        const { name, description, date, user_id, trail_id } = req.body;
        console.log("REQ.BODY:", req.body);          
        console.log("NAME:", name);                   
        console.log("DESCRIPTION:", description);
        console.log("DATE:", date); 
        console.log("USER_ID:", user_id); 
        console.log("USER_TRAIL:", trail_id);       
        const updatedCertificate = await CertificateModel.updateCertificate(req.params.id, name, description, date, user_id, trail_id);
        if (updatedCertificate) {
        res.status(200).json(updatedCertificate);
        } else {
        res.status(404).json({ error: 'Certificado não encontrado' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteCertificate(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const certificateDelete = await CertificateModel.deleteCertificate(id);
      return res.status(200).json({ message: 'Certficado deletado com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar certificado:', err);
      res.status(500).json({ error: 'Erro ao deletar certificado' });
    }
  }
};

module.exports = CertificateController;