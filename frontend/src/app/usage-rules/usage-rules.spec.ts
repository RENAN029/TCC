import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageRules } from './usage-rules';

describe('UsageRules', () => {
  let component: UsageRules;
  let fixture: ComponentFixture<UsageRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageRules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageRules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
