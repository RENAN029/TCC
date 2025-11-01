import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface CardRequestData {
  personalInfo: {
    name: string;
    gender: string;
    birthDate: string;
    cpf: string;
    educationLevel: string;
    registrationNumber: string;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  documents: {
    enrollmentFile?: File;
    photoFile?: File;
    photoUrl?: string;
  };
}

@Component({
  selector: 'app-card-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-request.html',
  styleUrls: ['./card-request.css']
})
export class CardRequest implements OnInit {
  request: CardRequestData = {
    personalInfo: {
      name: '',
      gender: '',
      birthDate: '',
      cpf: '',
      educationLevel: '',
      registrationNumber: ''
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    documents: {}
  };

  studentEmail: string = '';
  currentStep: number = 1;
  totalSteps: number = 3;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('currentUser');
    if (!user || JSON.parse(user).type !== 'student') {
      this.router.navigate(['/login']);
      return;
    }
    this.studentEmail = JSON.parse(user).email;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onEnrollmentFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.request.documents.enrollmentFile = file;
    }
  }

  async onPhotoFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.request.documents.photoFile = file;
      
      try {
        this.request.documents.photoUrl = await this.fileToDataURL(file);
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

  async submitRequest() {
    if (!this.isFormValid()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (this.request.documents.photoFile && !this.request.documents.photoUrl) {
      try {
        this.request.documents.photoUrl = await this.fileToDataURL(this.request.documents.photoFile);
      } catch (error) {
        alert('Erro ao processar a foto. Tente novamente.');
        return;
      }
    }

    this.updateStudentInfo();

    const requestData = {
      id: this.generateRequestId(),
      studentEmail: this.studentEmail,
      studentName: this.request.personalInfo.name,
      submittedAt: new Date().toISOString(),
      personalInfo: this.request.personalInfo,
      address: this.request.address,
      documents: {
        enrollmentFile: this.request.documents.enrollmentFile?.name,
        photoUrl: this.request.documents.photoUrl
      },
      status: 'pending' as const,
      isRenewal: false
    };

    this.savePendingRequest(requestData);
    
    alert('Solicitação enviada com sucesso! Aguarde a análise da administração.');
    this.router.navigate(['/student-dashboard']);
  }

  private updateStudentInfo() {
    const students = this.getStudents();
    const studentIndex = students.findIndex((student: any) => student.email === this.studentEmail);
    
    if (studentIndex !== -1) {
      students[studentIndex].name = this.request.personalInfo.name;
      students[studentIndex].personalInfo = this.request.personalInfo;
      students[studentIndex].address = this.request.address;
      students[studentIndex].registrationNumber = this.request.personalInfo.registrationNumber;
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

  isFormValid(): boolean {
    const { personalInfo, address, documents } = this.request;
    
    return !!(personalInfo.name && personalInfo.gender && personalInfo.birthDate && 
             personalInfo.cpf && personalInfo.educationLevel && personalInfo.registrationNumber &&
             address.street && address.number && address.neighborhood &&
             address.city && address.state &&
             documents.enrollmentFile && documents.photoFile);
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}