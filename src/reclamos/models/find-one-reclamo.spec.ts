import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { FindOneReclamo } from './find-one-reclamo';

describe('FindOneReclamo', () => {
  const base = {
    id: 11,
    numero: 42,
    fechaHoraInicio: new Date('2026-05-04T10:00:00.000Z'),
    idResolucion: 1,
    rubros: 'laboral',
    usuario: { nombre: 'Ada', nroHabilitacion: 123 },
  };

  it('mapea reclamantes/reclamados, conciliador, fechas y clausulas', () => {
    const reclamo = plainToInstance(FindOneReclamo, {
      ...base,
      partes: [
        { idParte: 1, rol: RECLAMANTE, postergo: false, incomparendoParte: false, incomparendoPatrocinante: false, multado: false, parte: { nombre: 'Reclamante', nroDocumento: '1', cuil: '2', tipoDocumento: { sintetico: 'DNI' }, domicilio: 'Calle 1', localidad: 'Ciudad', esApoderado: false } },
        { idParte: 2, rol: RECLAMADO, postergo: true, incomparendoParte: true, incomparendoPatrocinante: false, multado: true, nroWhatsappParte: '111', parte: { nombre: 'Reclamado', nroDocumento: '3', cuil: '4', tipoDocumento: { sintetico: 'LC' }, patrocinante: { nombre: 'Abogada', nroMatricula: 9, nroCasillero: 10, domicilio: 'Calle 2', localidad: 'Otra' }, esApoderado: true } },
      ],
      clausulas: { type: 'doc', content: [] },
      googleEventId: 'event-1',
      horaFin: null,
      proximaAudiencia: null,
    });

    expect(reclamo.toReclamantes()).toMatchObject([{ id: 1, nombre: 'Reclamante', tipoDocumento: { sintetico: 'DNI' } }]);
    expect(reclamo.toReclamados()).toMatchObject([
      { id: 2, nombre: 'Reclamado', nroWhatsappParte: '111', postergo: true, patrocinante: { nombre: 'Abogada', nroMatricula: 9 } },
    ]);
    expect(reclamo.toFindOneReclamoDTO(3)).toMatchObject({
      id: 11,
      numero: 42,
      cantidad: 3,
      conciliador: { nombre: 'Ada', nroHabilitacion: 123 },
      googleEventId: 'event-1',
      clausulas: { type: 'doc', content: [] },
      reclamantes: expect.any(Array),
      reclamados: expect.any(Array),
    });
  });

  it('devuelve listas indefinidas cuando no se proporcionan relaciones', () => {
    const reclamo = plainToInstance(FindOneReclamo, { ...base, partes: undefined });
    expect(reclamo.toReclamantes()).toBeUndefined();
    expect(reclamo.toReclamados()).toBeUndefined();
    expect(reclamo.toFindOneReclamoDTO(0)).toMatchObject({ reclamantes: undefined, reclamados: undefined, cantidad: 0 });
  });

  it('normaliza valores nulos/ausentes de parte y patrocinante a defaults del DTO', () => {
    const reclamo = plainToInstance(FindOneReclamo, {
      ...base,
      partes: [{ idParte: 3, rol: RECLAMANTE, parte: { tipoDocumento: {} } }],
    });
    expect(reclamo.toReclamantes()?.[0]).toMatchObject({
      id: 3,
      nombre: '',
      nroDocumento: '',
      cuil: '',
      domicilio: '',
      localidad: '',
      esApoderado: false,
      tipoDocumento: { sintetico: '' },
    });
  });
});
