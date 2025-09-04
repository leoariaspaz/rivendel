import { Test, TestingModule } from '@nestjs/testing';
import { PartesService } from './partes.service';

describe('PartesService', () => {
  let service: PartesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartesService],
    }).compile();

    service = module.get<PartesService>(PartesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
