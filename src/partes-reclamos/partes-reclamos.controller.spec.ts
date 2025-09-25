import { Test, TestingModule } from '@nestjs/testing';
import { PartesReclamosController } from './partes-reclamos.controller';
import { PartesReclamosService } from './partes-reclamos.service';

describe('PartesReclamosController', () => {
  let controller: PartesReclamosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartesReclamosController],
      providers: [PartesReclamosService],
    }).compile();

    controller = module.get<PartesReclamosController>(PartesReclamosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
