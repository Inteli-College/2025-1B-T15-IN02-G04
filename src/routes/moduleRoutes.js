const express = require('express');
const moduleController = require('../controllers/moduleController');

const router = express.Router();

// Listar todos os módulos
router.get('/', moduleController.getAllModules);

// Buscar módulos com informações da trilha
router.get('/with-trail-info', moduleController.getModulesWithTrailInfo);

// IMPORTANTE: Rotas específicas devem vir ANTES das rotas com parâmetros
// Buscar módulos por trilha
router.get('/trail/:trailId', moduleController.getModulesByTrailId);

// Buscar módulo por nome
router.get('/name/:name', moduleController.getModuleByName);

// Buscar módulo por ID (deve vir DEPOIS das rotas específicas)
router.get('/:id', moduleController.getModuleById);

// Criar novo módulo
router.post('/', moduleController.createModule);

// Atualizar módulo
router.put('/:id', moduleController.updateModule);

// Deletar módulo
router.delete('/:id', moduleController.deleteModule);

module.exports = router;