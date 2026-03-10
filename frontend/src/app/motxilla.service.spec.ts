import { TestBed } from '@angular/core/testing';

import { MotxillaService } from './motxilla.service';

describe('MotxillaService', () => {
  let service: MotxillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotxillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
