const express = require('express');
const router = express.Router();
const hierarchyController = require('../controllers/hierarchyController');

// Basic hierarchy routes
router.get('/hierarchies', hierarchyController.getAllHierarchies);
router.get('/hierarchies/:id', hierarchyController.getHierarchyById);
router.post('/hierarchies', hierarchyController.createHierarchy);
router.put('/hierarchies/:id', hierarchyController.updateHierarchy);
router.delete('/hierarchies/:id', hierarchyController.deleteHierarchy);

// Additional hierarchy routes
router.get('/hierarchies/user/:userId', hierarchyController.getHierarchiesByUser);
router.get('/hierarchies/mentor/:userId', hierarchyController.getMenteesByMentor);
router.get('/hierarchies/mentee/:userId', hierarchyController.getMentorsByMentee);

module.exports = router; 