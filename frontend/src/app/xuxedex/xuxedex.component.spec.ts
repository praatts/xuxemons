import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XuxedexComponent } from './xuxedex.component';

describe('XuxedexComponent', () => {
  let component: XuxedexComponent;
  let fixture: ComponentFixture<XuxedexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XuxedexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XuxedexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
