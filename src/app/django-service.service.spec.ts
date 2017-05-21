import { TestBed, inject } from '@angular/core/testing';

import { DjangoServiceService } from './django-service.service';

describe('DjangoServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DjangoServiceService]
    });
  });

  it('should ...', inject([DjangoServiceService], (service: DjangoServiceService) => {
    expect(service).toBeTruthy();
  }));
});
