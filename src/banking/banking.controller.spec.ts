import { Test, TestingModule } from '@nestjs/testing';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';

jest.mock('./banking.service', () => ({ BankingService: class BankingService {} }));

describe('BankingController', () => {
  let controller: BankingController;
  const service = { getCBUFromAlias: jest.fn(), getCuentaFromCBU: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankingController],
      providers: [{ provide: BankingService, useValue: service }],
    }).compile();

    controller = module.get<BankingController>(BankingController);
  });

  it('combina alias y datos bancarios en una respuesta pública', async () => {
    service.getCBUFromAlias.mockResolvedValue('cbu-1');
    service.getCuentaFromCBU.mockResolvedValue({
      cuenta: '123',
      nombreBancoDestino: 'Banco',
      nombreTitular: 'Ada',
      titulares: [{ idTributario: '20-1' }],
    });
    await expect(controller.bankingData('ada.alias')).resolves.toEqual({
      cuenta: '123',
      bancoDestino: 'Banco',
      titular: 'Ada',
      cuilTitular: '20-1',
    });
    expect(service.getCuentaFromCBU).toHaveBeenCalledWith('cbu-1');
  });

  it('usa cuil vacío si no hay titulares y no retorna datos ante error de búsqueda', async () => {
    service.getCBUFromAlias.mockResolvedValue('cbu-1');
    service.getCuentaFromCBU
      .mockResolvedValueOnce({ cuenta: '123', nombreBancoDestino: 'Banco', nombreTitular: 'Ada', titulares: [] })
      .mockResolvedValueOnce(undefined);
    await expect(controller.bankingData('ada.alias')).resolves.toMatchObject({ cuilTitular: '' });
    await expect(controller.bankingData('missing')).resolves.toBeUndefined();
  });
});
