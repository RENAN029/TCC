// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carteirinha_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Função para criar o banco e tabelas se não existirem
const initializeDatabase = async () => {
  try {
    // Criar banco de dados se não existir
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Conectar ao banco específico
    const dbConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    // Criar tabelas
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS email_domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain VARCHAR(255) NOT NULL UNIQUE,
        institution VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        registration_number VARCHAR(100),
        card_status ENUM('none', 'active', 'expired', 'pending', 'rejected') DEFAULT 'none',
        rejection_reason TEXT,
        personal_info JSON,
        address JSON,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS card_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        personal_info JSON NOT NULL,
        address JSON NOT NULL,
        photo_url TEXT,
        enrollment_file_name VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        is_renewal BOOLEAN DEFAULT FALSE,
        previous_card_id INT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS student_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        card_number VARCHAR(100) UNIQUE NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100) NOT NULL,
        course VARCHAR(255) NOT NULL,
        institution VARCHAR(255) DEFAULT 'IFRN',
        birth_date DATE NOT NULL,
        cpf VARCHAR(14) NOT NULL,
        address JSON NOT NULL,
        photo_url TEXT,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiration_date TIMESTAMP NOT NULL,
        status ENUM('active', 'expired', 'rejected') DEFAULT 'active',
        rejection_reason TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Banco de dados e tabelas criados com sucesso!');
    await dbConnection.end();
  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error);
  }
};

module.exports = { pool, initializeDatabase };