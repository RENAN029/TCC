// backend/routes/cards.js
const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken, requireStudent, requireAdmin } = require('../middleware/auth');
const { validateStudentData } = require('../middleware/validation');

// Solicitações de carteirinha (estudante)
router.post('/request', 
  authenticateToken, 
  requireStudent, 
  validateStudentData, 
  cardController.createRequest
);

// Gerenciar solicitações (admin)
router.get('/requests/pending',
  authenticateToken,
  requireAdmin,
  cardController.getPendingRequests
);

router.put('/requests/:requestId/approve',
  authenticateToken,
  requireAdmin,
  cardController.approveRequest
);

router.put('/requests/:requestId/reject',
  authenticateToken,
  requireAdmin,
  cardController.rejectRequest
);

module.exports = router;