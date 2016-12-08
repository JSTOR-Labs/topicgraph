/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LabsAuthService } from './labs-auth.service';

describe('MyjstorAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LabsAuthService]
    });
  });

  it('should ...', inject([LabsAuthService], (service: LabsAuthService) => {
    expect(service).toBeTruthy();
  }));
});
