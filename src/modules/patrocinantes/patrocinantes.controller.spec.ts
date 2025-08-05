import { Test, TestingModule } from '@nestjs/testing';
import { PatrocinantesController } from './patrocinantes.controller';
import { PatrocinantesService } from './patrocinantes.service';

describe('PatrocinantesController', () => {
  let controller: PatrocinantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatrocinantesController],
      providers: [PatrocinantesService],
    }).compile();

    controller = module.get<PatrocinantesController>(PatrocinantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
