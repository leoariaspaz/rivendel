import { Test, TestingModule } from '@nestjs/testing';
import { ResolucionesController } from './resoluciones.controller';
import { ResolucionesService } from './resoluciones.service';

describe('ResolucionesController', () => {
  let controller: ResolucionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResolucionesController],
      providers: [ResolucionesService],
    }).compile();

    controller = module.get<ResolucionesController>(ResolucionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
