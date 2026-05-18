import { Test, TestingModule } from '@nestjs/testing';
import { TipdocsController } from './tipdocs.controller';
import { TipdocsService } from './tipdocs.service';

describe('TipdocsController', () => {
  let controller: TipdocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipdocsController],
      providers: [TipdocsService],
    }).compile();

    controller = module.get<TipdocsController>(TipdocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
