import { Test, TestingModule } from '@nestjs/testing';
import { PartesController } from './partes.controller';
import { PartesService } from './partes.service';

describe('PartesController', () => {
  let controller: PartesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartesController],
      providers: [PartesService],
    }).compile();

    controller = module.get<PartesController>(PartesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
