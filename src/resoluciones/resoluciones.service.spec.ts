import { ResolucionesService } from './resoluciones.service';

describe('ResolucionesService', () => {
  let service: ResolucionesService;

  beforeEach(() => {
    service = new ResolucionesService();
  });

  it('valida resoluciones conocidas y entrega el texto descriptivo', async () => {
    await expect(service.exists(1)).resolves.toEqual({ isValid: true, message: '' });
    expect(service.getDescripcion(1)).toBe('Pendiente');
  });

  it('rechaza ids desconocidos y devuelve descripción vacía', async () => {
    await expect(service.exists(-1)).resolves.toEqual({ isValid: false, message: 'No existe la resolución.' });
    expect(service.getDescripcion(-1)).toBe('');
  });
});
