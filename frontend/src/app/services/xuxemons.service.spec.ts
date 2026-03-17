import { TestBed } from '@angular/core/testing';

import { XuxemonsService } from '../services/xuxemons.service';

describe('XuxemonsService', () => {
  let service: XuxemonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XuxemonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
