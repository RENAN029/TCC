// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'carteirinha_secret';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe
    let user;
    if (decoded.type === 'student') {
      const [rows] = await pool.execute(
        'SELECT id, email FROM students WHERE email = ?',
        [decoded.email]
      );
      user = rows[0];
    } else if (decoded.type === 'admin') {
      const [rows] = await pool.execute(
        'SELECT id, username FROM admins WHERE username = ? AND is_active = TRUE',
        [decoded.email]
      );
      user = rows[0];
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = { ...decoded, id: user.id };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (req.user.type !== 'student') {
    return res.status(403).json({ error: 'Acesso restrito a estudantes' });
  }
  next();
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email, 
      type: user.type,
      id: user.id 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStudent,
  generateToken
};