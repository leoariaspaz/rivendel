import { Test, TestingModule } from '@nestjs/testing';
import { PatrocinantesService } from './patrocinantes.service';

describe('PatrocinantesService', () => {
  let service: PatrocinantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatrocinantesService],
    }).compile();

    service = module.get<PatrocinantesService>(PatrocinantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
