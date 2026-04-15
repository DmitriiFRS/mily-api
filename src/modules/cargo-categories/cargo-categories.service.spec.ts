import { Test, TestingModule } from '@nestjs/testing';
import { CargoCategoriesService } from './cargo-categories.service';

describe('CargoCategoriesService', () => {
  let service: CargoCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoCategoriesService],
    }).compile();

    service = module.get<CargoCategoriesService>(CargoCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
