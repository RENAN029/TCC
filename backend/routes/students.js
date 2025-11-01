// backend/routes/students.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireStudent } = require('../middleware/auth');

// Todas as rotas exigem autenticação de estudante
router.use(authenticateToken);
router.use(requireStudent);

// Dashboard do estudante
router.get('/dashboard', studentController.getDashboard);

// Perfil do estudante
router.put('/profile', studentController.updateProfile);

// Carteirinha do estudante
router.get('/card', studentController.getCard);

module.exports = router;