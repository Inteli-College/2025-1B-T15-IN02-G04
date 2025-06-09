const express = require('express');
const router = express.Router();
const CertificateController = require('../controllers/certificateController');

router.get('/certificates', CertificateController.getAllCertificates);

router.get('/certificates/:id', CertificateController.getCertificateById);

router.put('/certificates/:id', CertificateController.updateCertificate);

router.post('/certificates', CertificateController.createCertificate);

router.delete('/certificates/:id', CertificateController.deleteCertificate);

module.exports = router;