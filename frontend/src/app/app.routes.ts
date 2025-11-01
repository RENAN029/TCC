import { Routes } from '@angular/router';
import { Login } from './login/login';
import { StudentDashboard } from './student-dashboard/student-dashboard';
import { StudentCard } from './student-card/student-card';
import { CardRequest } from './card-request/card-request';
import { RenewalRequest } from './renewal-request/renewal-request';
import { UsageRules } from './usage-rules/usage-rules';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { PendingRequests } from './pending-requests/pending-requests';
import { EmailDomains } from './email-domains/email-domains';
import { StudentManagement } from './student-management/student-management';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'student-dashboard', component: StudentDashboard },
  { path: 'student-card', component: StudentCard },
  { path: 'card-request', component: CardRequest },
  { path: 'renewal-request', component: RenewalRequest },
  { path: 'usage-rules', component: UsageRules },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'pending-requests', component: PendingRequests },
  { path: 'email-domains', component: EmailDomains },
  { path: 'student-management', component: StudentManagement },
  { path: '**', redirectTo: '/login' }
];