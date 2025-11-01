// backend/controllers/studentController.js
const Student = require('../models/Student');
const CardRequest = require('../models/CardRequest');
const { pool } = require('../config/database');

class StudentController {
  async getDashboard(req, res) {
    try {
      const studentId = req.user.id;

      // Buscar dados do estudante
      const student = await Student.findByEmail(req.user.email);
      if (!student) {
        return res.status(404).json({ error: 'Estudante não encontrado' });
      }

      // Buscar solicitações pendentes
      const pendingRequests = await CardRequest.findByStudentId(studentId);
      const hasPendingRequest = pendingRequests.some(req => req.status === 'pending');

      // Buscar carteirinha ativa
      const [cards] = await pool.execute(
        `SELECT * FROM student_cards 
         WHERE student_id = ? AND status = 'active' 
         ORDER BY issue_date DESC LIMIT 1`,
        [studentId]
      );

      const currentCard = cards[0] || null;

      res.json({
        student: {
          email: student.email,
          name: student.name,
          registrationNumber: student.registration_number,
          cardStatus: student.card_status,
          rejectionReason: student.rejection_reason
        },
        currentCard,
        hasPendingRequest,
        studentStatus: student.card_status
      });

    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateProfile(req, res) {
    try {
      const studentId = req.user.id;
      const updateData = req.body;

      await Student.update(studentId, updateData);

      res.json({ message: 'Perfil atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getCard(req, res) {
    try {
      const studentId = req.user.id;

      const [cards] = await pool.execute(
        `SELECT * FROM student_cards 
         WHERE student_id = ? 
         ORDER BY issue_date DESC LIMIT 1`,
        [studentId]
      );

      const card = cards[0];
      if (!card) {
        return res.status(404).json({ error: 'Carteirinha não encontrada' });
      }

      res.json({ card });

    } catch (error) {
      console.error('Erro ao buscar carteirinha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new StudentController();