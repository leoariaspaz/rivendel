import { PrismaService } from 'src/shared/services/prisma.service';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { PartesReclamoDTO } from './dto/partes-reclamo.dto';
import { PartesReclamoDTOList } from './dto/partes-reclamos-dto-list';
import { PartesReclamosService } from './partes-reclamos.service';
import { PartesReclamosList } from './models/partes-reclamos-list';

describe('PartesReclamosService', () => {
  let service: PartesReclamosService;

  beforeEach(() => {
    service = new PartesReclamosService();
  });

  const dto = (idParte: number, rol: number, extras: Partial<PartesReclamoDTO> = {}) =>
    Object.assign(new PartesReclamoDTO(), { idParte, rol, ...extras });

  const relation = (id: number, idParte: number, rol: number, extras: Record<string, any> = {}) =>
    ({ id, idParte, rol, nroWhatsappParte: null, nroWhatsappPatrocinante: null, postergo: false, incomparendoParte: false, incomparendoPatrocinante: false, multado: false, ...extras }) as any;

  it('crea relaciones nuevas de ambos roles con valores predeterminados normalizados', () => {
    const fresh = service.getNew(
      new PartesReclamosList(),
      new PartesReclamoDTOList([dto(1, RECLAMADO), dto(2, RECLAMADO, { nroWhatsappParte: '111', postergo: true })]),
      new PartesReclamoDTOList([dto(3, RECLAMANTE)])
    );
    expect(fresh).toEqual([
      expect.objectContaining({ idParte: 1, rol: RECLAMADO, nroWhatsappParte: null, postergo: false, multado: false }),
      expect.objectContaining({ idParte: 2, rol: RECLAMADO, nroWhatsappParte: '111', postergo: true }),
      expect.objectContaining({ idParte: 3, rol: RECLAMANTE }),
    ]);
  });

  it('no crea ni actualiza relaciones si los arrays opcionales no se envían', () => {
    expect(service.getNew(new PartesReclamosList(), undefined, undefined)).toEqual([]);
    expect(service.getUpdated(new PartesReclamosList(), undefined, undefined)).toEqual([]);
    expect(service.getRemoved(new PartesReclamosList(), undefined, undefined)).toEqual([]);
    expect(service.update({} as PrismaService, undefined)).toEqual([]);
  });

  it('detecta relaciones existentes modificadas y las actualiza por id de relación', () => {
    const existing = relation(70, 4, RECLAMANTE, { nroWhatsappParte: 'old' });
    const changed = dto(4, RECLAMANTE, { nroWhatsappParte: 'new', postergo: true });
    const updates = service.getUpdated(new PartesReclamosList([existing]), undefined, new PartesReclamoDTOList([changed]));
    expect(updates).toEqual([expect.objectContaining({ id: 70, nroWhatsappParte: 'new', postergo: true })]);

    const update = jest.fn().mockResolvedValue(undefined);
    expect(service.update({ partesReclamos: { update } } as any, updates as any)).toHaveLength(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: 70 },
      data: expect.objectContaining({ nroWhatsappParte: 'new', postergo: true, multado: false }),
    });
  });

  it('calcula altas y bajas por rol sin eliminar una relación de otro rol', () => {
    const existing = new PartesReclamosList([relation(70, 4, RECLAMANTE), relation(71, 5, RECLAMADO)]);
    const newClaimants = new PartesReclamoDTOList([dto(4, RECLAMANTE), dto(6, RECLAMANTE)]);
    expect(service.getNew(existing, undefined, newClaimants)).toEqual([expect.objectContaining({ idParte: 6, rol: RECLAMANTE })]);
    expect(service.getRemoved(existing, undefined, newClaimants)).toEqual([{ id: 71 }]);
  });

  it('convierte DTOs al rol solicitado y preserva valores falsy durante update', () => {
    const person = dto(4, 0, { nroWhatsappParte: '', nroWhatsappPatrocinante: '', postergo: false });
    expect(person.toReclamado().rol).toBe(RECLAMADO);
    expect(person.toReclamante().rol).toBe(RECLAMANTE);

    const existing = relation(70, 4, RECLAMANTE, { nroWhatsappParte: 'old', postergo: true });
    const modified = dto(4, RECLAMANTE, { nroWhatsappParte: '', postergo: false });
    const result = service.getUpdated(new PartesReclamosList([existing]), undefined, new PartesReclamoDTOList([modified]));
    expect(result?.[0]).toMatchObject({ nroWhatsappParte: null, nroWhatsappPatrocinante: null, postergo: false });
  });
});
