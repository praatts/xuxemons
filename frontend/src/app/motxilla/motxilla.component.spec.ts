import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotxillaComponent } from './motxilla.component';

describe('MotxillaComponent', () => {
  let component: MotxillaComponent;
  let fixture: ComponentFixture<MotxillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotxillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotxillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
