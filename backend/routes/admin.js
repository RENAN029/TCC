// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Todas as rotas exigem autenticação de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard admin
router.get('/dashboard', adminController.getDashboard);

// Gerenciar estudantes
router.get('/students', adminController.getStudents);
router.delete('/students/:studentId', adminController.deleteStudent);

// Gerenciar domínios de email
router.get('/email-domains', adminController.getEmailDomains);
router.post('/email-domains', adminController.createEmailDomain);
router.put('/email-domains/:domainId', adminController.updateEmailDomain);
router.delete('/email-domains/:domainId', adminController.deleteEmailDomain);

module.exports = router;