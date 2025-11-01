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
  course: string;
  institution: string;
  birthDate: string;
  cpf: string;
}

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-card.html',
  styleUrls: ['./student-card.css']
})
export class StudentCard implements OnInit {
  card: StudentCardData | null = null;
  studentEmail: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'student') {
      this.router.navigate(['/login']);
      return;
    }

    this.studentEmail = JSON.parse(user).email;
    this.loadCard();
  }

  loadCard() {
    const savedCard = localStorage.getItem(`card_${this.studentEmail}`);
    if (savedCard) {
      this.card = JSON.parse(savedCard);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  printCard() {
    window.print();
  }

  downloadCard() {
    // Simular download - em produção, geraria PDF
    alert('Funcionalidade de download em desenvolvimento');
  }

  hasPhoto(): boolean {
    return !!this.card?.photoUrl;
  }

  getPhotoUrl(): string {
    return this.card?.photoUrl || '';
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}