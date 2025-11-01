// backend/controllers/authController.js
const Student = require('../models/Student');
const User = require('../models/User');
const EmailDomain = require('../models/EmailDomain');
const { generateToken } = require('../middleware/auth');
const { validateEmail } = require('../middleware/validation');

class AuthController {
  async studentLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      // Verificar domínio de email
      const isValidDomain = await EmailDomain.isValidDomain(email);
      if (!isValidDomain) {
        return res.status(400).json({ error: 'Email institucional não permitido' });
      }

      // Buscar estudante
      const student = await Student.findByEmail(email);
      if (!student) {
        return res.status(404).json({ error: 'Estudante não encontrado' });
      }

      // Verificar senha
      const isPasswordValid = await Student.verifyPassword(password, student.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Atualizar último login
      await Student.updateLoginTime(student.id);

      // Gerar token
      const token = generateToken({
        email: student.email,
        type: 'student',
        id: student.id
      });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          email: student.email,
          type: 'student',
          name: student.name
        }
      });

    } catch (error) {
      console.error('Erro no login do estudante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async studentRegister(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      // Verificar domínio de email
      const isValidDomain = await EmailDomain.isValidDomain(email);
      if (!isValidDomain) {
        return res.status(400).json({ error: 'Email institucional não permitido' });
      }

      // Verificar se estudante já existe
      const existingStudent = await Student.findByEmail(email);
      if (existingStudent) {
        return res.status(409).json({ error: 'Estudante já cadastrado' });
      }

      // Criar estudante
      const studentId = await Student.create({ email, password });

      // Gerar token
      const token = generateToken({
        email: email,
        type: 'student',
        id: studentId
      });

      res.status(201).json({
        message: 'Estudante cadastrado com sucesso',
        token,
        user: {
          email: email,
          type: 'student'
        }
      });

    } catch (error) {
      console.error('Erro no cadastro do estudante:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }

      // Buscar admin
      const admin = await User.findAdminByUsername(username);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador não encontrado' });
      }

      // Verificar senha
      const isPasswordValid = await User.verifyAdminPassword(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gerar token
      const token = generateToken({
        email: admin.username,
        type: 'admin',
        id: admin.id
      });

      res.json({
        message: 'Login administrativo realizado com sucesso',
        token,
        user: {
          email: admin.username,
          type: 'admin',
          name: admin.name
        }
      });

    } catch (error) {
      console.error('Erro no login administrativo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AuthController();