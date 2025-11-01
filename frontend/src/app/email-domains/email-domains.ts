import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface EmailDomain {
  id: string;
  domain: string;
  institution: string;
  createdAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-email-domains',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './email-domains.html',
  styleUrls: ['./email-domains.css']
})
export class EmailDomains implements OnInit {
  domains: EmailDomain[] = [];
  newDomain: string = '';
  newInstitution: string = '';
  showAddForm: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDomains();
  }

  loadDomains() {
    // Simular carregamento - em produção, seria API
    const savedDomains = localStorage.getItem('emailDomains');
    if (savedDomains) {
      this.domains = JSON.parse(savedDomains);
    } else {
      // Dados iniciais
      this.domains = [
        {
          id: '1',
          domain: '@escolar.ifrn.edu.br',
          institution: 'IFRN',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '2', 
          domain: '@aluno.ufrn.br',
          institution: 'UFRN',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      this.saveDomains();
    }
  }

  saveDomains() {
    localStorage.setItem('emailDomains', JSON.stringify(this.domains));
  }

  addDomain() {
    if (!this.newDomain || !this.newInstitution) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Validar formato do domínio
    if (!this.newDomain.startsWith('@')) {
      this.newDomain = '@' + this.newDomain;
    }

    const domainExists = this.domains.some(
      domain => domain.domain.toLowerCase() === this.newDomain.toLowerCase()
    );

    if (domainExists) {
      alert('Este domínio já está cadastrado');
      return;
    }

    const newDomain: EmailDomain = {
      id: Date.now().toString(),
      domain: this.newDomain.toLowerCase(),
      institution: this.newInstitution,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.domains.push(newDomain);
    this.saveDomains();
    
    this.newDomain = '';
    this.newInstitution = '';
    this.showAddForm = false;
    
    alert('Domínio adicionado com sucesso!');
  }

  toggleDomainStatus(domain: EmailDomain) {
    domain.isActive = !domain.isActive;
    this.saveDomains();
  }

  deleteDomain(domain: EmailDomain) {
    if (confirm(`Tem certeza que deseja remover o domínio ${domain.domain}?`)) {
      this.domains = this.domains.filter(d => d.id !== domain.id);
      this.saveDomains();
      alert('Domínio removido com sucesso!');
    }
  }

  getActiveDomainsCount(): number {
    return this.domains.filter(domain => domain.isActive).length;
  }

  validateEmailDomain(email: string): boolean {
    return this.domains.some(domain => 
      domain.isActive && email.toLowerCase().endsWith(domain.domain.toLowerCase())
    );
  }
}