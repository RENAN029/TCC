import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Student {
  id: string;
  email: string;
  name: string;
  registrationNumber: string;
  cardStatus: 'active' | 'expired' | 'pending' | 'rejected' | 'none';
  cardExpiration?: string;
  lastLogin?: string;
  registeredAt: string;
  personalInfo?: any;
  address?: any;
  rejectionReason?: string;
}

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-management.html',
  styleUrls: ['./student-management.css']
})
export class StudentManagement implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchTerm: string = '';
  filterStatus: 'all' | 'active' | 'expired' | 'pending' | 'rejected' | 'none' = 'all';
  selectedStudent: Student | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadStudents();
  }

  loadStudents() {
    // Carregar estudantes REAIS do localStorage
    const savedStudents = localStorage.getItem('students');
    const students = savedStudents ? JSON.parse(savedStudents) : [];
    
    // Atualizar status das carteirinhas baseado na data de expiração
    this.students = students.map((student: Student) => {
      const card = this.getStudentCard(student.email);
      if (card && card.status === 'active') {
        // Verificar se a carteirinha ativa está expirada
        if (this.isCardExpired(card)) {
          // Atualizar status para expirado
          student.cardStatus = 'expired';
          // Também atualizar a carteirinha
          card.status = 'expired';
          localStorage.setItem(`card_${student.email}`, JSON.stringify(card));
        }
      }
      return student;
    });

    this.applyFilters();
  }

  // CHANGE FROM private TO public
  public getStudentCard(studentEmail: string): any {
    const card = localStorage.getItem(`card_${studentEmail}`);
    return card ? JSON.parse(card) : null;
  }

  private isCardExpired(card: any): boolean {
    if (!card.expirationDate) return false;
    
    const expirationDate = new Date(card.expirationDate);
    const today = new Date();
    
    // Considerar expirado se a data for anterior a hoje
    return expirationDate < today;
  }

  isCardExpiredForStudent(student: Student): boolean {
    const card = this.getStudentCard(student.email);
    if (card) {
      return this.isCardExpired(card);
    }
    return false;
  }

  getActualStudentStatus(student: Student): string {
    const card = this.getStudentCard(student.email);
    if (card) {
      if (card.status === 'active' && this.isCardExpired(card)) {
        return 'expired';
      }
      return card.status;
    }
    return student.cardStatus;
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchTerm || 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const actualStatus = this.getActualStudentStatus(student);
      const matchesStatus = this.filterStatus === 'all' || actualStatus === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange(status: 'all' | 'active' | 'expired' | 'pending' | 'rejected' | 'none') {
    this.filterStatus = status;
    this.applyFilters();
  }

  viewStudentDetails(student: Student) {
    this.selectedStudent = student;
  }

  closeDetails() {
    this.selectedStudent = null;
  }

  removeStudent(student: Student) {
    if (confirm(`Tem certeza que deseja remover o estudante ${student.name}?\n\nEsta ação não poderá ser desfeita.`)) {
      // Remover estudante da lista
      this.students = this.students.filter(s => s.id !== student.id);
      localStorage.setItem('students', JSON.stringify(this.students));
      
      // Remover carteirinha se existir
      localStorage.removeItem(`card_${student.email}`);
      
      // Remover pedidos pendentes se existirem
      this.removeStudentPendingRequests(student.email);
      
      this.applyFilters();
      this.closeDetails();
      alert('Estudante removido com sucesso!');
    }
  }

  private removeStudentPendingRequests(studentEmail: string) {
    const pendingRequests = this.getPendingRequests();
    const updatedRequests = pendingRequests.filter((request: any) => request.studentEmail !== studentEmail);
    localStorage.setItem('pendingRequests', JSON.stringify(updatedRequests));
  }

  private getPendingRequests(): any[] {
    const requests = localStorage.getItem('pendingRequests');
    return requests ? JSON.parse(requests) : [];
  }

  exportStudents() {
    const dataStr = JSON.stringify(this.filteredStudents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `estudantes_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa',
      'expired': 'Expirada', 
      'pending': 'Pendente',
      'rejected': 'Rejeitada',
      'none': 'Sem Carteirinha'
    };
    return statusMap[status] || status;
  }

  getEducationLevelText(level: string): string {
    const levels: { [key: string]: string } = {
      'ensino_medio': 'Ensino Médio',
      'graduacao': 'Graduação',
      'pos_graduacao': 'Pós-Graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    };
    return levels[level] || level;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}