import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRequest } from './card-request';

describe('CardRequest', () => {
  let component: CardRequest;
  let fixture: ComponentFixture<CardRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
