import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  email: string;
  password?: string;
  type: 'student' | 'admin';
}

interface Student {
  id: string;
  email: string;
  password: string;
  name: string;
  registrationNumber: string;
  cardStatus: 'active' | 'expired' | 'pending' | 'rejected' | 'none';
  registeredAt: string;
  lastLogin?: string;
  personalInfo?: any;
  address?: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginType: 'student' | 'admin' = 'student';
  studentEmail: string = '';
  adminUsername: string = '';
  adminPassword: string = '';
  errorMessage: string = '';
  
  // Estados para fluxo do estudante
  currentStep: 'email' | 'password' | 'createPassword' = 'email';
  studentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  // Fluxo principal de login
  onLogin() {
    if (this.loginType === 'student') {
      this.studentLogin();
    } else {
      this.adminLogin();
    }
  }

  private studentLogin() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!this.studentEmail || !emailRegex.test(this.studentEmail)) {
      this.errorMessage = 'Por favor, insira um email válido';
      return;
    }

    // Verificar domínios de email permitidos
    const allowedDomains = this.getAllowedDomains();
    const isValidDomain = allowedDomains.some(domain => 
      this.studentEmail.toLowerCase().endsWith(domain.toLowerCase())
    );

    if (!isValidDomain) {
      this.errorMessage = 'Email institucional não permitido. Use um email da instituição cadastrada.';
      return;
    }

    // Verificar se estudante já está cadastrado
    const existingStudent = this.getStudentByEmail(this.studentEmail);
    
    if (existingStudent) {
      // Estudante existe, pedir senha
      this.currentStep = 'password';
      this.errorMessage = '';
    } else {
      // Estudante não existe, ir direto para criar senha
      this.currentStep = 'createPassword';
      this.errorMessage = '';
    }
  }

  // Verificar senha do estudante existente
  verifyStudentPassword() {
    if (!this.studentPassword) {
      this.errorMessage = 'Por favor, digite sua senha';
      return;
    }

    const student = this.getStudentByEmail(this.studentEmail);
    
    if (!student) {
      this.errorMessage = 'Estudante não encontrado';
      return;
    }

    if (student.password !== this.hashPassword(this.studentPassword)) {
      this.errorMessage = 'Senha incorreta';
      return;
    }

    // Login bem-sucedido
    this.completeStudentLogin(student);
  }

  // Criar senha para novo estudante
  createPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    // Criar novo estudante
    const newStudent: Student = {
      id: this.generateStudentId(),
      email: this.studentEmail,
      password: this.hashPassword(this.newPassword),
      name: '',
      registrationNumber: this.generateRegistrationNumber(),
      cardStatus: 'none',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.saveStudent(newStudent);
    this.completeStudentLogin(newStudent);
  }

  private completeStudentLogin(student: Student) {
    // Atualizar último login
    student.lastLogin = new Date().toISOString();
    this.updateStudent(student);

    const user: User = {
      email: student.email,
      type: 'student'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.router.navigate(['/student-dashboard']);
  }

  // Navegação entre steps
  backToEmail() {
    this.currentStep = 'email';
    this.errorMessage = '';
    this.studentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // Utilitários
  private hashPassword(password: string): string {
    // Hash simples para demonstração
    return btoa(password);
  }

  private getStudentByEmail(email: string): Student | null {
    const students = this.getStudents();
    return students.find(s => s.email === email) || null;
  }

  private saveStudent(student: Student) {
    const students = this.getStudents();
    // Remover estudante existente se houver
    const filtered = students.filter(s => s.email !== student.email);
    filtered.push(student);
    localStorage.setItem('students', JSON.stringify(filtered));
  }

  private updateStudent(updatedStudent: Student) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.email === updatedStudent.email);
    if (index !== -1) {
      students[index] = updatedStudent;
      localStorage.setItem('students', JSON.stringify(students));
    }
  }

  private getStudents(): Student[] {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  }

  private adminLogin() {
    if (!this.adminUsername || !this.adminPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.adminUsername === 'admin' && this.adminPassword === 'admin123') {
      const user: User = {
        email: this.adminUsername,
        type: 'admin'
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.errorMessage = 'Credenciais inválidas';
    }
  }

  private getAllowedDomains(): string[] {
    const savedDomains = localStorage.getItem('emailDomains');
    if (savedDomains) {
      const domains = JSON.parse(savedDomains);
      return domains.filter((domain: any) => domain.isActive).map((domain: any) => domain.domain);
    }
    return ['@escolar.ifrn.edu.br', '@aluno.ufrn.br'];
  }

  private generateStudentId(): string {
    return 'STU_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateRegistrationNumber(): string {
    return 'MAT' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  switchLoginType(type: 'student' | 'admin') {
    this.loginType = type;
    this.errorMessage = '';
    this.currentStep = 'email';
    this.studentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}