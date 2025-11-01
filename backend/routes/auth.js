// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login estudante
router.post('/student/login', authController.studentLogin);

// Cadastro estudante
router.post('/student/register', authController.studentRegister);

// Login admin
router.post('/admin/login', authController.adminLogin);

module.exports = router;