import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDomains } from './email-domains';

describe('EmailDomains', () => {
  let component: EmailDomains;
  let fixture: ComponentFixture<EmailDomains>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDomains]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailDomains);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
