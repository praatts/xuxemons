import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XuxemonDetailComponent } from './xuxemon-detail.component';

describe('XuxemonDetailComponent', () => {
  let component: XuxemonDetailComponent;
  let fixture: ComponentFixture<XuxemonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XuxemonDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XuxemonDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
