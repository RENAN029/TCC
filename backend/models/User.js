// backend/models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async createAdmin(username, password, name) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admins (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name]
    );
    return result.insertId;
  }

  static async findAdminByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
      [username]
    );
    return rows[0];
  }

  static async verifyAdminPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;