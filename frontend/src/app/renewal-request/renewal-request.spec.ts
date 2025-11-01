import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalRequest } from './renewal-request';

describe('RenewalRequest', () => {
  let component: RenewalRequest;
  let fixture: ComponentFixture<RenewalRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewalRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
