import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface DashboardStats {
  totalStudents: number;
  pendingRequests: number;
  activeCards: number;
  expiredCards: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  stats: DashboardStats = {
    totalStudents: 0,
    pendingRequests: 0,
    activeCards: 0,
    expiredCards: 0
  };

  recentActivity: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadRealStats();
    this.loadRecentActivity();
  }

  private loadRealStats() {
    const students = this.getStudents();
    this.stats.totalStudents = students.length;

    const pendingRequests = this.getPendingRequests();
    this.stats.pendingRequests = pendingRequests.filter((req: any) => req.status === 'pending').length;

    let activeCards = 0;
    let expiredCards = 0;

    students.forEach((student: any) => {
      if (student.cardStatus === 'active') {
        activeCards++;
      } else if (student.cardStatus === 'expired') {
        expiredCards++;
      }
    });

    this.stats.activeCards = activeCards;
    this.stats.expiredCards = expiredCards;
  }

  private loadRecentActivity() {
    const pendingRequests = this.getPendingRequests();
    const students = this.getStudents();
    
    this.recentActivity = [];

    const recentRequests = pendingRequests
      .slice(-5)
      .map((request: any) => ({
        student: request.studentName,
        action: request.isRenewal ? 'Renovação solicitada' : 'Solicitação enviada',
        time: this.formatTimeAgo(request.submittedAt),
        type: 'request'
      }));

    const recentLogins = students
      .filter((student: any) => student.lastLogin)
      .sort((a: any, b: any) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
      .slice(0, 5)
      .map((student: any) => ({
        student: student.name || student.email,
        action: 'Login realizado',
        time: this.formatTimeAgo(student.lastLogin),
        type: 'login'
      }));

    this.recentActivity = [...recentRequests, ...recentLogins].slice(0, 5);
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} h atrás`;
    } else {
      return `${diffDays} dias atrás`;
    }
  }

  private getStudents(): any[] {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  }

  private getPendingRequests(): any[] {
    const requests = localStorage.getItem('pendingRequests');
    return requests ? JSON.parse(requests) : [];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}