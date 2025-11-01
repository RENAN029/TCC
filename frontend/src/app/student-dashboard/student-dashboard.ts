import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface StudentCardData {
  id: string;
  studentName: string;
  registrationNumber: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending' | 'rejected';
  photoUrl?: string;
  rejectionReason?: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {
  studentEmail: string = '';
  currentCard: StudentCardData | null = null;
  hasPendingRequest: boolean = false;
  studentStatus: string = 'none';
  showTestOptions: boolean = false;
  rejectionReason: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(user);
    if (userData.type !== 'student') {
      this.router.navigate(['/login']);
      return;
    }

    this.studentEmail = userData.email;
    this.loadStudentData();
  }

  loadStudentData() {
    const savedCard = localStorage.getItem(`card_${this.studentEmail}`);
    if (savedCard) {
      this.currentCard = JSON.parse(savedCard);
      this.rejectionReason = this.currentCard?.rejectionReason || '';
    }

    this.hasPendingRequest = this.checkPendingRequest();
    this.studentStatus = this.getStudentStatus();
  }

  private checkPendingRequest(): boolean {
    const pendingRequests = this.getPendingRequests();
    return pendingRequests.some((request: any) => 
      request.studentEmail === this.studentEmail && request.status === 'pending'
    );
  }

  private getStudentStatus(): string {
    if (this.currentCard) {
      return this.currentCard.status;
    }
    
    if (this.hasPendingRequest) {
      return 'pending';
    }
    
    const students = this.getStudents();
    const student = students.find((s: any) => s.email === this.studentEmail);
    return student?.cardStatus || 'none';
  }

  private getPendingRequests(): any[] {
    const requests = localStorage.getItem('pendingRequests');
    return requests ? JSON.parse(requests) : [];
  }

  private getStudents(): any[] {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  }

  expireCardForTesting() {
    if (!this.currentCard) {
      alert('Você não possui uma carteirinha para expirar!');
      return;
    }

    const expiredCard = {
      ...this.currentCard,
      expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'expired' as const
    };

    localStorage.setItem(`card_${this.studentEmail}`, JSON.stringify(expiredCard));
    this.currentCard = expiredCard;
    this.studentStatus = 'expired';
    
    alert('✅ Carteirinha expirada para teste! Agora você pode testar a renovação.');
  }

  rejectCardForTesting() {
    if (!this.currentCard) {
      alert('Você não possui uma carteirinha para recusar!');
      return;
    }

    const reason = prompt('Digite o motivo da recusa (para teste):');
    if (reason) {
      const rejectedCard = {
        ...this.currentCard,
        status: 'rejected' as const,
        rejectionReason: reason
      };

      localStorage.setItem(`card_${this.studentEmail}`, JSON.stringify(rejectedCard));
      this.currentCard = rejectedCard;
      this.studentStatus = 'rejected';
      this.rejectionReason = reason;
      
      alert('✅ Carteirinha recusada para teste! Motivo salvo.');
    }
  }

  createValidCardForTesting() {
    const testCard: StudentCardData = {
      id: 'TEST_CARD_123',
      studentName: 'Estudante Teste',
      registrationNumber: 'MATTEST123',
      issueDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      photoUrl: ''
    };

    localStorage.setItem(`card_${this.studentEmail}`, JSON.stringify(testCard));
    this.currentCard = testCard;
    this.studentStatus = 'active';
    this.rejectionReason = '';
    
    alert('✅ Carteirinha válida criada para teste!');
  }

  createExpiringCardForTesting() {
    const expiringCard: StudentCardData = {
      id: 'TEST_CARD_EXPIRING',
      studentName: 'Estudante Teste',
      registrationNumber: 'MATEXP123',
      issueDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      photoUrl: ''
    };

    localStorage.setItem(`card_${this.studentEmail}`, JSON.stringify(expiringCard));
    this.currentCard = expiringCard;
    this.studentStatus = 'active';
    this.rejectionReason = '';
    
    alert('✅ Carteirinha prestes a expirar criada para teste! Expira em 2 dias.');
  }

  requestNewCard() {
    this.router.navigate(['/card-request']);
  }

  requestRenewal() {
    this.router.navigate(['/renewal-request']);
  }

  viewUsageRules() {
    this.router.navigate(['/usage-rules']);
  }

  viewMyCard() {
    this.router.navigate(['/student-card']);
  }

  isCardExpired(): boolean {
    if (!this.currentCard) return false;
    return new Date(this.currentCard.expirationDate) < new Date();
  }

  canRequestNewCard(): boolean {
    return !this.currentCard && !this.hasPendingRequest && this.studentStatus === 'none';
  }

  canRequestRenewal(): boolean {
    return (this.currentCard && this.isCardExpired()) || 
           this.studentStatus === 'rejected' ||
           (!this.currentCard && this.studentStatus === 'expired');
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

  getStatusBadgeClass(): string {
    return this.studentStatus;
  }

  toggleTestOptions() {
    this.showTestOptions = !this.showTestOptions;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
  
}