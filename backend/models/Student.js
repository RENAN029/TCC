// backend/models/Student.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Student {
  static async create(studentData) {
    const {
      email,
      password,
      name = '',
      registrationNumber = ''
    } = studentData;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      `INSERT INTO students (email, password, name, registration_number) 
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, name, registrationNumber]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async updateLoginTime(studentId) {
    await pool.execute(
      'UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [studentId]
    );
  }

  static async update(studentId, updateData) {
    const allowedFields = ['name', 'registration_number', 'card_status', 'rejection_reason', 'personal_info', 'address'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return;

    values.push(studentId);
    const query = `UPDATE students SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
  }

  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT id, email, name, registration_number, card_status, 
             rejection_reason, registered_at, last_login 
      FROM students 
      ORDER BY registered_at DESC
    `);
    return rows;
  }

  static async delete(studentId) {
    await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Student;