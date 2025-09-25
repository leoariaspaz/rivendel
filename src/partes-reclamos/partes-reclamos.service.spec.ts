import { Test, TestingModule } from '@nestjs/testing';
import { PartesReclamosService } from './partes-reclamos.service';

describe('PartesReclamosService', () => {
  let service: PartesReclamosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartesReclamosService],
    }).compile();

    service = module.get<PartesReclamosService>(PartesReclamosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
