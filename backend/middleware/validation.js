// backend/middleware/validation.js
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCPF = (cpf) => {
  // Implementação básica de validação de CPF
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.length === 11;
};

const validateStudentData = (req, res, next) => {
  const { personalInfo, address } = req.body;

  if (!personalInfo || !address) {
    return res.status(400).json({ error: 'Dados pessoais e endereço são obrigatórios' });
  }

  const requiredFields = ['name', 'gender', 'birthDate', 'cpf', 'educationLevel', 'registrationNumber'];
  const missingFields = requiredFields.filter(field => !personalInfo[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` 
    });
  }

  if (!validateEmail(req.user.email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (!validateCPF(personalInfo.cpf)) {
    return res.status(400).json({ error: 'CPF inválido' });
  }

  next();
};

module.exports = {
  validateStudentData,
  validateEmail,
  validateCPF
};