// backend/controllers/adminController.js
const Student = require('../models/Student');
const EmailDomain = require('../models/EmailDomain');
const { pool } = require('../config/database');

class AdminController {
  async getDashboard(req, res) {
    try {
      // Estatísticas
      const [studentsCount] = await pool.execute('SELECT COUNT(*) as total FROM students');
      const [pendingCount] = await pool.execute('SELECT COUNT(*) as total FROM card_requests WHERE status = "pending"');
      const [activeCards] = await pool.execute('SELECT COUNT(*) as total FROM student_cards WHERE status = "active"');
      const [expiredCards] = await pool.execute('SELECT COUNT(*) as total FROM student_cards WHERE status = "expired"');

      // Atividade recente
      const [recentActivity] = await pool.execute(`
        (SELECT 'request' as type, student_name as student, 
                CONCAT(IF(is_renewal, 'Renovação', 'Solicitação'), ' enviada') as action,
                submitted_at as time
         FROM card_requests 
         WHERE status = 'pending'
         ORDER BY submitted_at DESC 
         LIMIT 3)
        UNION
        (SELECT 'login' as type, name as student, 'Login realizado' as action,
                last_login as time
         FROM students 
         WHERE last_login IS NOT NULL
         ORDER BY last_login DESC 
         LIMIT 2)
        ORDER BY time DESC 
        LIMIT 5
      `);

      res.json({
        stats: {
          totalStudents: studentsCount[0].total,
          pendingRequests: pendingCount[0].total,
          activeCards: activeCards[0].total,
          expiredCards: expiredCards[0].total
        },
        recentActivity
      });

    } catch (error) {
      console.error('Erro ao buscar dashboard admin:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStudents(req, res) {
    try {
      const students = await Student.findAll();
      res.json({ students });
    } catch (error) {
      console.error('Erro ao buscar estudantes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteStudent(req, res) {
    try {
      const { studentId } = req.params;
      await Student.delete(studentId);
      res.json({ message: 'Estudante removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover estudante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getEmailDomains(req, res) {
    try {
      const domains = await EmailDomain.findAll();
      res.json({ domains });
    } catch (error) {
      console.error('Erro ao buscar domínios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async createEmailDomain(req, res) {
    try {
      const { domain, institution } = req.body;

      if (!domain || !institution) {
        return res.status(400).json({ error: 'Domínio e instituição são obrigatórios' });
      }

      const domainId = await EmailDomain.create(domain, institution);
      res.status(201).json({ message: 'Domínio criado com sucesso', domainId });
    } catch (error) {
      console.error('Erro ao criar domínio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateEmailDomain(req, res) {
    try {
      const { domainId } = req.params;
      const { isActive } = req.body;

      await EmailDomain.updateStatus(domainId, isActive);
      res.json({ message: 'Domínio atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar domínio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteEmailDomain(req, res) {
    try {
      const { domainId } = req.params;
      await EmailDomain.delete(domainId);
      res.json({ message: 'Domínio removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover domínio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AdminController();