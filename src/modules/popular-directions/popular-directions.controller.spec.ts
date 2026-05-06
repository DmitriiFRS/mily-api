import { Test, TestingModule } from '@nestjs/testing';
import { PopularDirectionsController } from './popular-directions.controller';
import { PopularDirectionsService } from './popular-directions.service';

describe('PopularDirectionsController', () => {
  let controller: PopularDirectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopularDirectionsController],
      providers: [PopularDirectionsService],
    }).compile();

    controller = module.get<PopularDirectionsController>(PopularDirectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
