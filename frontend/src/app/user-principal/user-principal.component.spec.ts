import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrincipalComponent } from './user-principal.component';

describe('UserPrincipalComponent', () => {
  let component: UserPrincipalComponent;
  let fixture: ComponentFixture<UserPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
