import { Test, TestingModule } from '@nestjs/testing';
import { CargoCategoriesController } from './cargo-categories.controller';
import { CargoCategoriesService } from './cargo-categories.service';

describe('CargoCategoriesController', () => {
  let controller: CargoCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoCategoriesController],
      providers: [CargoCategoriesService],
    }).compile();

    controller = module.get<CargoCategoriesController>(CargoCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
