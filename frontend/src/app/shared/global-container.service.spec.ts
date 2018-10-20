import { TestBed, inject } from '@angular/core/testing';

import { GlobalContainerService } from './global-container.service';

describe('GlobalContainerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalContainerService]
    });
  });

  it('should be created', inject([GlobalContainerService], (service: GlobalContainerService) => {
    expect(service).toBeTruthy();
  }));
});
