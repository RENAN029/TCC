// backend/models/CardRequest.js
const { pool } = require('../config/database');

class CardRequest {
  static async create(requestData) {
    const {
      studentId,
      studentEmail,
      studentName,
      personalInfo,
      address,
      photoUrl,
      enrollmentFileName,
      isRenewal = false,
      previousCardId = null
    } = requestData;

    const [result] = await pool.execute(
      `INSERT INTO card_requests 
       (student_id, student_email, student_name, personal_info, address, 
        photo_url, enrollment_file_name, is_renewal, previous_card_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        studentEmail,
        studentName,
        JSON.stringify(personalInfo),
        JSON.stringify(address),
        photoUrl,
        enrollmentFileName,
        isRenewal,
        previousCardId
      ]
    );

    return result.insertId;
  }

  static async findPending() {
    const [rows] = await pool.execute(`
      SELECT cr.*, s.registration_number 
      FROM card_requests cr 
      JOIN students s ON cr.student_id = s.id 
      WHERE cr.status = 'pending' 
      ORDER BY cr.submitted_at DESC
    `);
    return rows;
  }

  static async findByStudentId(studentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM card_requests WHERE student_id = ? ORDER BY submitted_at DESC',
      [studentId]
    );
    return rows;
  }

  static async updateStatus(requestId, status, rejectionReason = null) {
    const processedAt = status !== 'pending' ? new Date() : null;
    
    await pool.execute(
      `UPDATE card_requests 
       SET status = ?, rejection_reason = ?, processed_at = ? 
       WHERE id = ?`,
      [status, rejectionReason, processedAt, requestId]
    );
  }

  static async findById(requestId) {
    const [rows] = await pool.execute(
      'SELECT * FROM card_requests WHERE id = ?',
      [requestId]
    );
    return rows[0];
  }
}

module.exports = CardRequest;