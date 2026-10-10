import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { PartesReclamoDTO } from './partes-reclamo.dto';
import { PartesReclamoDTOList } from './partes-reclamos-dto-list';
import { PartesReclamosList } from '../models/partes-reclamos-list';
import { PartesReclamos } from '@prisma/client';

const dto = (idParte: number, rol: number, extras: Partial<PartesReclamoDTO> = {}) =>
  Object.assign(new PartesReclamoDTO(), { idParte, rol, ...extras });
const existing = (id: number, idParte: number, rol: number): PartesReclamos =>
  ({
    id,
    idParte,
    idReclamo: 1,
    rol,
    nroWhatsappParte: null,
    nroWhatsappPatrocinante: null,
    postergo: false,
    incomparendoParte: false,
    incomparendoPatrocinante: false,
    multado: false,
  }) satisfies PartesReclamos;

describe('PartesReclamoDTOList', () => {
  it('une listas presentes, vacías y omitidas', () => {
    const claimant = new PartesReclamoDTOList([dto(1, RECLAMANTE)]);
    const defendant = new PartesReclamoDTOList([dto(2, RECLAMADO)]);
    expect(new PartesReclamoDTOList().joinPartes(undefined, undefined)).toHaveLength(0);
    expect(Array.from(claimant.joinPartes(defendant, claimant), (item) => item.idParte)).toEqual([2, 1]);
    expect(claimant.joinPartes(undefined, defendant)).toHaveLength(1);
  });

  it('resta por rol, conserva solo intersecciones y convierte al rol destino', () => {
    const existingList = new PartesReclamosList([existing(11, 1, RECLAMANTE), existing(12, 2, RECLAMADO)]);
    const input = new PartesReclamoDTOList([dto(1, 0), dto(3, 0)]);
    expect(Array.from(input.subtractReclamantes(existingList), (item) => item.idParte)).toEqual([3]);
    expect(Array.from(input.subtractReclamados(existingList), (item) => item.idParte)).toEqual([1, 3]);
    expect(Array.from(input.intersectReclamantes(existingList), (item) => item.idParte)).toEqual([1]);
    expect(input.intersectReclamados(existingList)).toHaveLength(0);
    expect(Array.from(input.toReclamadosList(), (item) => item.rol)).toEqual([RECLAMADO, RECLAMADO]);
    expect(Array.from(input.toReclamantesList(), (item) => item.rol)).toEqual([RECLAMANTE, RECLAMANTE]);
  });

  it('serializa ambos números de WhatsApp y estados de relación independientemente', () => {
    const input = new PartesReclamoDTOList([
      dto(4, RECLAMANTE, {
        nroWhatsappParte: '111',
        nroWhatsappPatrocinante: '222',
        postergo: true,
        incomparendoParte: true,
        incomparendoPatrocinante: false,
        multado: true,
      }),
    ]);
    expect(input.toCreateManyInput()).toEqual([
      {
        idParte: 4,
        rol: RECLAMANTE,
        incomparendoParte: true,
        incomparendoPatrocinante: false,
        multado: true,
        nroWhatsappParte: '111',
        nroWhatsappPatrocinante: '222',
        postergo: true,
      },
    ]);
  });

  it('actualiza relaciones coincidentes y omite ids que no tienen relación previa', () => {
    const current = new PartesReclamosList([existing(11, 1, RECLAMANTE)]);
    const incoming = new PartesReclamoDTOList([
      dto(1, RECLAMANTE, { nroWhatsappParte: '111', nroWhatsappPatrocinante: '222', postergo: true }),
      dto(3, RECLAMANTE),
    ]);
    const updated = incoming.updateReclamantes(current);
    expect(updated).toHaveLength(2);
    expect(updated[0]).toMatchObject({
      id: 11,
      nroWhatsappParte: '111',
      nroWhatsappPatrocinante: '222',
      postergo: true,
    });
    expect(updated[1]).toBeUndefined();
    expect(incoming.updateReclamados(current)).toHaveLength(2);
  });

  it('comprueba existencia por idParte y produce false para listas sin coincidencia', () => {
    const list = new PartesReclamoDTOList([dto(1, RECLAMANTE)]);
    expect(list.existsReclamante(1)).toBe(true);
    expect(list.existsReclamante(2)).toBe(false);
    expect(list.existsReclamado(1)).toBe(true);
    expect(list.existsReclamado(2)).toBe(false);
  });
});

describe('PartesReclamoDTO', () => {
  it('asigna rol y normaliza flags/WhatsApp al actualizar una relación', () => {
    const input = dto(1, 0, { nroWhatsappParte: '', nroWhatsappPatrocinante: '222', postergo: true });
    expect(input.toReclamado().rol).toBe(RECLAMADO);
    expect(input.toReclamante().rol).toBe(RECLAMANTE);
    const row = existing(11, 1, RECLAMANTE);
    expect(input.update(row)).toMatchObject({
      nroWhatsappParte: null,
      nroWhatsappPatrocinante: '222',
      postergo: true,
      incomparendoParte: false,
      incomparendoPatrocinante: false,
      multado: false,
    });
  });
});
