import { Test, TestingModule } from '@nestjs/testing';
import { PopularDirectionsService } from './popular-directions.service';

describe('PopularDirectionsService', () => {
  let service: PopularDirectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopularDirectionsService],
    }).compile();

    service = module.get<PopularDirectionsService>(PopularDirectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
