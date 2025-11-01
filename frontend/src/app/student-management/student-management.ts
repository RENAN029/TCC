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
    const savedStudents = localStorage.getItem('students');
    this.students = savedStudents ? JSON.parse(savedStudents) : [];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchTerm || 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' || student.cardStatus === this.filterStatus;
      
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
      this.students = this.students.filter(s => s.id !== student.id);
      localStorage.setItem('students', JSON.stringify(this.students));
      
      localStorage.removeItem(`card_${student.email}`);
      
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

  isCardExpired(student: Student): boolean {
    if (!student.cardExpiration) return false;
    return new Date(student.cardExpiration) < new Date();
  }
}