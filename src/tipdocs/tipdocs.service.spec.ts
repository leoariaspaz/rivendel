import { Test, TestingModule } from '@nestjs/testing';
import { TipdocsService } from './tipdocs.service';

describe('TipdocsService', () => {
  let service: TipdocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipdocsService],
    }).compile();

    service = module.get<TipdocsService>(TipdocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
