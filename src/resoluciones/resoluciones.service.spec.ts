import { Test, TestingModule } from '@nestjs/testing';
import { ResolucionesService } from './resoluciones.service';

describe('ResolucionesService', () => {
  let service: ResolucionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResolucionesService],
    }).compile();

    service = module.get<ResolucionesService>(ResolucionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
