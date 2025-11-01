import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Rule {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-usage-rules',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usage-rules.html',
  styleUrls: ['./usage-rules.css']
})
export class UsageRules {
  rules: Rule[] = [
    {
      title: 'Uso Pessoal',
      description: 'A carteirinha é de uso pessoal e intransferível. É proibido ceder, emprestar ou permitir que terceiros utilizem sua carteirinha.',
      icon: '👤'
    },
    {
      title: 'Apresentação Obrigatória',
      description: 'A carteirinha deve ser apresentada ao motorista no momento do embarque, juntamente com documento de identificação com foto.',
      icon: '🎫'
    },
    {
      title: 'Validade',
      description: 'A carteirinha tem validade de 1 ano a partir da data de emissão. Renovações devem ser solicitadas com antecedência.',
      icon: '📅'
    },
    {
      title: 'Conservação',
      description: 'Mantenha a carteirinha em bom estado de conservação. Não dobre, risque ou danifique o documento.',
      icon: '🛡️'
    },
    {
      title: 'Perda ou Roubo',
      description: 'Em caso de perda, roubo ou extravio, comunique imediatamente à administração para bloqueio e solicitação de segunda via.',
      icon: '🚨'
    },
    {
      title: 'Horários de Uso',
      description: 'O transporte escolar opera nos horários estabelecidos pela prefeitura. Consulte os horários específicos da sua rota.',
      icon: '⏰'
    },
    {
      title: 'Comportamento',
      description: 'Mantenha comportamento educado e respeitoso durante o uso do transporte. Siga as orientações do motorista.',
      icon: '🙂'
    },
    {
      title: 'Proibições',
      description: 'É proibido portar objetos perigosos, consumir bebidas alcoólicas ou fumar dentro do veículo.',
      icon: '🚫'
    }
  ];

  currentDate: string = new Date().toISOString().split('T')[0];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }
}