// backend/models/EmailDomain.js
const { pool } = require('../config/database');

class EmailDomain {
  static async create(domain, institution) {
    const [result] = await pool.execute(
      'INSERT INTO email_domains (domain, institution) VALUES (?, ?)',
      [domain, institution]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM email_domains ORDER BY created_at DESC'
    );
    return rows;
  }

  static async updateStatus(domainId, isActive) {
    await pool.execute(
      'UPDATE email_domains SET is_active = ? WHERE id = ?',
      [isActive, domainId]
    );
  }

  static async delete(domainId) {
    await pool.execute('DELETE FROM email_domains WHERE id = ?', [domainId]);
  }

  static async isValidDomain(email) {
    const [rows] = await pool.execute(
      'SELECT domain FROM email_domains WHERE is_active = TRUE'
    );
    
    const allowedDomains = rows.map(row => row.domain.toLowerCase());
    return allowedDomains.some(domain => 
      email.toLowerCase().endsWith(domain.toLowerCase())
    );
  }
}

module.exports = EmailDomain;