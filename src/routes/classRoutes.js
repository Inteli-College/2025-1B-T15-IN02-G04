const express = require('express');
const classController = require('../controllers/classController');

const router = express.Router();

console.log('🔍 [ROUTES] ClassRoutes carregado');
console.log('🔍 [ROUTES] ClassController:', typeof classController);

// 🧪 ROTA DE TESTE - ADICIONE ESTA PRIMEIRA
router.get('/test', (req, res) => {
  console.log('🧪 [ROUTES] Rota /test de aulas chamada');
  res.json({ 
    status: 'OK', 
    message: 'Rota de aulas funcionando',
    timestamp: new Date().toISOString()
  });
});

// 🧪 ROTA DE TESTE AVANÇADO
router.get('/test-controller', classController.testBasic);

// 📋 ROTAS PRINCIPAIS
console.log('🔍 [ROUTES] Registrando rotas de aulas...');

// Listar todas as aulas
router.get('/', (req, res) => {
  console.log('🔍 [ROUTES] GET / chamada (getAllClasses)');
  classController.getAllClasses(req, res);
});

// Buscar aulas com informações do módulo
router.get('/with-module-info', (req, res) => {
  console.log('🔍 [ROUTES] GET /with-module-info chamada');
  classController.getClassesWithModuleInfo(req, res);
});

// IMPORTANTE: Rotas específicas devem vir ANTES das rotas com parâmetros
// Buscar aulas por módulo
router.get('/module/:moduleId', (req, res) => {
  console.log('🔍 [ROUTES] GET /module/:moduleId chamada com ID:', req.params.moduleId);
  classController.getClassesByModuleId(req, res);
});

// Buscar aula por nome
router.get('/name/:name', (req, res) => {
  console.log('🔍 [ROUTES] GET /name/:name chamada com nome:', req.params.name);
  classController.getClassByName(req, res);
});

// Buscar aula por ID (deve vir DEPOIS das rotas específicas)
router.get('/:id', (req, res) => {
  console.log('🔍 [ROUTES] GET /:id chamada com ID:', req.params.id);
  classController.getClassById(req, res);
});

// Criar nova aula
router.post('/', (req, res) => {
  console.log('🔍 [ROUTES] POST / chamada (createClass)');
  classController.createClass(req, res);
});

// Atualizar aula
router.put('/:id', (req, res) => {
  console.log('🔍 [ROUTES] PUT /:id chamada com ID:', req.params.id);
  classController.updateClass(req, res);
});

// Deletar aula
router.delete('/:id', (req, res) => {
  console.log('🔍 [ROUTES] DELETE /:id chamada com ID:', req.params.id);
  classController.deleteClass(req, res);
});

console.log('✅ [ROUTES] Todas as rotas de aulas registradas');

module.exports = router;