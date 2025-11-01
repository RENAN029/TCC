// backend/controllers/cardController.js
const CardRequest = require('../models/CardRequest');
const Student = require('../models/Student');
const { pool } = require('../config/database');

class CardController {
  async createRequest(req, res) {
    try {
      const studentId = req.user.id;
      const {
        personalInfo,
        address,
        photoUrl,
        enrollmentFileName,
        isRenewal = false
      } = req.body;

      // Buscar estudante
      const student = await Student.findByEmail(req.user.email);
      if (!student) {
        return res.status(404).json({ error: 'Estudante não encontrado' });
      }

      // Criar solicitação
      const requestId = await CardRequest.create({
        studentId,
        studentEmail: student.email,
        studentName: personalInfo.name,
        personalInfo,
        address,
        photoUrl,
        enrollmentFileName,
        isRenewal
      });

      // Atualizar status do estudante
      await Student.update(studentId, { card_status: 'pending' });

      res.status(201).json({
        message: 'Solicitação enviada com sucesso',
        requestId
      });

    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const requests = await CardRequest.findPending();
      res.json({ requests });
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async approveRequest(req, res) {
    try {
      const { requestId } = req.params;

      const request = await CardRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      // Gerar número da carteirinha
      const cardNumber = 'CARD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Calcular data de expiração (1 ano)
      const issueDate = new Date();
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      // Criar carteirinha
      const personalInfo = JSON.parse(request.personal_info);
      const address = JSON.parse(request.address);

      await pool.execute(
        `INSERT INTO student_cards 
         (student_id, card_number, student_name, registration_number, course, 
          birth_date, cpf, address, photo_url, expiration_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.student_id,
          cardNumber,
          request.student_name,
          personalInfo.registrationNumber,
          this.getCourseFromEducationLevel(personalInfo.educationLevel),
          personalInfo.birthDate,
          personalInfo.cpf,
          JSON.stringify(address),
          request.photo_url,
          expirationDate
        ]
      );

      // Atualizar status da solicitação
      await CardRequest.updateStatus(requestId, 'approved');

      // Atualizar status do estudante
      await Student.update(request.student_id, { 
        card_status: 'active',
        name: request.student_name,
        registration_number: personalInfo.registrationNumber,
        personal_info: request.personal_info,
        address: request.address
      });

      res.json({ 
        message: 'Solicitação aprovada com sucesso',
        cardNumber 
      });

    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async rejectRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({ error: 'Motivo da recusa é obrigatório' });
      }

      const request = await CardRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      // Atualizar status da solicitação
      await CardRequest.updateStatus(requestId, 'rejected', rejectionReason);

      // Atualizar status do estudante
      await Student.update(request.student_id, { 
        card_status: 'rejected',
        rejection_reason: rejectionReason
      });

      res.json({ message: 'Solicitação recusada com sucesso' });

    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  getCourseFromEducationLevel(educationLevel) {
    const courses = {
      'ensino_medio': 'Ensino Médio',
      'graduacao': 'Graduação',
      'pos_graduacao': 'Pós-Graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    };
    return courses[educationLevel] || 'Curso não especificado';
  }
}

module.exports = new CardController();