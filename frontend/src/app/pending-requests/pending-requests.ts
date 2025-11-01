import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface PendingRequestData {
  id: string;
  studentEmail: string;
  studentName: string;
  submittedAt: string;
  personalInfo: any;
  address: any;
  documents: any;
  status: 'pending' | 'approved' | 'rejected';
  isRenewal: boolean;
}

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-requests.html',
  styleUrls: ['./pending-requests.css']
})
export class PendingRequests implements OnInit {
  pendingRequests: PendingRequestData[] = [];
  filteredRequests: PendingRequestData[] = [];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  selectedRequest: PendingRequestData | null = null;
  
  showPhoto: boolean = false;
  showEnrollment: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadPendingRequests();
  }

  loadPendingRequests() {
    const savedRequests = localStorage.getItem('pendingRequests');
    if (savedRequests) {
      this.pendingRequests = JSON.parse(savedRequests);
    }

    this.applyFilter();
  }

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.filteredRequests = this.pendingRequests;
    } else {
      this.filteredRequests = this.pendingRequests.filter(
        request => request.status === this.filterStatus
      );
    }
  }

  onFilterChange(status: 'all' | 'pending' | 'approved' | 'rejected') {
    this.filterStatus = status;
    this.applyFilter();
  }

  viewRequest(request: PendingRequestData) {
    this.selectedRequest = request;
    this.showPhoto = false;
    this.showEnrollment = false;
  }

  closeDetails() {
    this.selectedRequest = null;
    this.showPhoto = false;
    this.showEnrollment = false;
  }

  approveRequest(request: PendingRequestData) {
    if (confirm(`Aprovar solicitação de ${request.studentName}?`)) {
      request.status = 'approved';
      
      const card = {
        id: this.generateCardId(),
        studentName: request.personalInfo.name,
        registrationNumber: request.personalInfo.registrationNumber,
        issueDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        course: this.getCourseFromEducationLevel(request.personalInfo.educationLevel),
        institution: 'IFRN',
        birthDate: request.personalInfo.birthDate,
        cpf: request.personalInfo.cpf,
        address: request.address,
        photoUrl: request.documents.photoUrl
      };

      localStorage.setItem(`card_${request.studentEmail}`, JSON.stringify(card));
      this.updateStudentStatus(request.studentEmail, 'active');
      this.updatePendingRequests();
      
      this.applyFilter();
      this.closeDetails();
      alert('Solicitação aprovada com sucesso!');
    }
  }

  rejectRequest(request: PendingRequestData) {
    const reason = prompt('Digite o motivo da reprovação:');
    if (reason) {
      request.status = 'rejected';
      this.updateStudentStatus(request.studentEmail, 'rejected', reason);
      this.updatePendingRequests();
      
      this.applyFilter();
      this.closeDetails();
      alert('Solicitação reprovada.');
    }
  }

  private updateStudentStatus(studentEmail: string, status: string, rejectionReason?: string) {
    const students = this.getStudents();
    const studentIndex = students.findIndex((student: any) => student.email === studentEmail);
    
    if (studentIndex !== -1) {
      students[studentIndex].cardStatus = status;
      
      if (rejectionReason) {
        students[studentIndex].rejectionReason = rejectionReason;
      }
      
      localStorage.setItem('students', JSON.stringify(students));
    }

    const cardKey = `card_${studentEmail}`;
    const savedCard = localStorage.getItem(cardKey);
    if (savedCard) {
      const card = JSON.parse(savedCard);
      card.status = status;
      if (rejectionReason) {
        card.rejectionReason = rejectionReason;
      }
      localStorage.setItem(cardKey, JSON.stringify(card));
    }
  }

  private updatePendingRequests() {
    localStorage.setItem('pendingRequests', JSON.stringify(this.pendingRequests));
  }

  private getStudents(): any[] {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  }

  private generateCardId(): string {
    return 'CARD_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateRegistrationNumber(): string {
    return 'MAT' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private getCourseFromEducationLevel(level: string): string {
    const courses: { [key: string]: string } = {
      'ensino_medio': 'Ensino Médio',
      'graduacao': 'Graduação',
      'pos_graduacao': 'Pós-Graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    };
    return courses[level] || 'Curso não especificado';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'approved': 'Aprovada',
      'rejected': 'Rejeitada'
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