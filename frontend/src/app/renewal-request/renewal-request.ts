import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  address?: any;
}

@Component({
  selector: 'app-renewal-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './renewal-request.html',
  styleUrls: ['./renewal-request.css']
})
export class RenewalRequest implements OnInit {
  useExistingData: boolean = true;
  studentEmail: string = '';
  existingData: StudentCardData | null = null;
  currentDate: string = new Date().toISOString().split('T')[0];

  renewalRequest = {
    personalInfo: {
      name: '',
      gender: '',
      birthDate: '',
      cpf: '',
      educationLevel: ''
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    documents: {
      enrollmentFile: null as File | null,
      photoFile: null as File | null,
      photoUrl: '' as string | null
    },
    updateData: false
  };

  constructor(public router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'student') {
      this.router.navigate(['/login']);
      return;
    }

    this.studentEmail = JSON.parse(user).email;
    this.loadExistingData();
  }

  loadExistingData() {
    const existingCard = localStorage.getItem(`card_${this.studentEmail}`);
    if (existingCard) {
      this.existingData = JSON.parse(existingCard);
      this.initializeWithExistingData();
    }
  }

  initializeWithExistingData() {
    if (this.existingData && this.useExistingData) {
      this.renewalRequest.personalInfo = { 
        name: this.existingData.studentName,
        gender: '',
        birthDate: this.existingData.birthDate,
        cpf: this.existingData.cpf,
        educationLevel: ''
      };
      if (this.existingData.address) {
        this.renewalRequest.address = { ...this.existingData.address };
      }
    }
  }

  onUseExistingDataChange() {
    if (this.useExistingData && this.existingData) {
      this.initializeWithExistingData();
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.renewalRequest = {
      personalInfo: {
        name: '',
        gender: '',
        birthDate: '',
        cpf: '',
        educationLevel: ''
      },
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      documents: {
        enrollmentFile: null,
        photoFile: null,
        photoUrl: null
      },
      updateData: !this.useExistingData
    };
  }

  onEnrollmentFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.renewalRequest.documents.enrollmentFile = file;
    }
  }

  async onPhotoFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.renewalRequest.documents.photoFile = file;
      
      // Converter a foto para data URL para armazenamento
      try {
        this.renewalRequest.documents.photoUrl = await this.fileToDataURL(file);
      } catch (error) {
        console.error('Erro ao processar a foto:', error);
        alert('Erro ao processar a foto. Tente novamente.');
      }
    }
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async submitRenewal() {
    if (!this.isFormValid()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Processar foto se foi selecionada uma nova
    if (this.renewalRequest.documents.photoFile && !this.renewalRequest.documents.photoUrl) {
      try {
        this.renewalRequest.documents.photoUrl = await this.fileToDataURL(this.renewalRequest.documents.photoFile);
      } catch (error) {
        alert('Erro ao processar a foto. Tente novamente.');
        return;
      }
    }

    // Se usando dados existentes e não selecionou nova foto, usar foto existente
    if (this.useExistingData && this.existingData?.photoUrl && !this.renewalRequest.documents.photoUrl) {
      this.renewalRequest.documents.photoUrl = this.existingData.photoUrl;
    }

    // Atualizar informações do estudante se necessário
    if (!this.useExistingData) {
      this.updateStudentInfo();
    }

    const requestData = {
      id: this.generateRequestId(),
      studentEmail: this.studentEmail,
      studentName: this.renewalRequest.personalInfo.name,
      submittedAt: new Date().toISOString(),
      personalInfo: this.renewalRequest.personalInfo,
      address: this.renewalRequest.address,
      documents: {
        enrollmentFile: this.renewalRequest.documents.enrollmentFile?.name,
        photoUrl: this.renewalRequest.documents.photoUrl
      },
      status: 'pending' as const,
      isRenewal: true,
      previousCardId: this.existingData?.id
    };

    // Salvar pedido na lista global de pedidos
    this.savePendingRequest(requestData);
    
    alert('Solicitação de renovação enviada com sucesso!');
    this.router.navigate(['/student-dashboard']);
  }

  isFormValid(): boolean {
    if (this.useExistingData) {
      // Para renovação com dados existentes, só precisa do comprovante de matrícula
      return !!this.renewalRequest.documents.enrollmentFile;
    } else {
      // Para renovação com dados atualizados, precisa de todos os campos
      const { personalInfo, address, documents } = this.renewalRequest;
      
      const personalInfoValid = !!(personalInfo.name && personalInfo.gender && 
                                 personalInfo.birthDate && personalInfo.cpf && 
                                 personalInfo.educationLevel);
      
      const addressValid = !!(address.street && address.number && 
                            address.neighborhood && address.city && address.state);
      
      const documentsValid = !!(documents.enrollmentFile && documents.photoFile);

      return personalInfoValid && addressValid && documentsValid;
    }
  }

  private updateStudentInfo() {
    const students = this.getStudents();
    const studentIndex = students.findIndex((student: any) => student.email === this.studentEmail);
    
    if (studentIndex !== -1) {
      students[studentIndex].name = this.renewalRequest.personalInfo.name;
      students[studentIndex].personalInfo = this.renewalRequest.personalInfo;
      students[studentIndex].address = this.renewalRequest.address;
      localStorage.setItem('students', JSON.stringify(students));
    }
  }

  private savePendingRequest(request: any) {
    const pendingRequests = this.getPendingRequests();
    pendingRequests.push(request);
    localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  }

  private getPendingRequests(): any[] {
    const requests = localStorage.getItem('pendingRequests');
    return requests ? JSON.parse(requests) : [];
  }

  private getStudents(): any[] {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
  }

  private generateRequestId(): string {
    return 'REQ_' + Math.random().toString(36).substr(2, 9).toUpperCase();
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

  // Método para navegação que pode ser usado no template
  navigateToDashboard() {
    this.router.navigate(['/student-dashboard']);
  }
}