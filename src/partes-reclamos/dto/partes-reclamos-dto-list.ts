import { PartesReclamoDTO } from 'src/partes-reclamos/dto/partes-reclamo.dto';
import { PartesReclamosList } from '../models/partes-reclamos-list';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { Logger } from '@nestjs/common';
import { PartesReclamosCreateManyReclamoInput } from 'src/generated/prisma/models';

export class PartesReclamoDTOList extends Array<PartesReclamoDTO> {
  private readonly logger = new Logger();

  constructor(private items: PartesReclamoDTO[] = []) {
    super(...Array.from(items));
  }

  joinPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamoDTOList {
    const join = [...(reclamados || []), ...(reclamantes || [])];
    return new PartesReclamoDTOList(join);
  }

  private subtractPartesReclamos(partesReclamos: PartesReclamosList, rol: number): PartesReclamoDTOList {
    const result = this.filter((parte) => !partesReclamos.contains(parte.idParte, rol));
    return new PartesReclamoDTOList(result);
  }

  subtractReclamados(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.subtractPartesReclamos(partesReclamos, RECLAMADO);
  }

  subtractReclamantes(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.subtractPartesReclamos(partesReclamos, RECLAMANTE);
  }

  toReclamadosList(): PartesReclamoDTOList {
    const list = this.map((parte) => Object.assign(new PartesReclamoDTO(), parte).toReclamado());
    return new PartesReclamoDTOList(list);
  }

  toReclamantesList(): PartesReclamoDTOList {
    const list = this.map((parte) => Object.assign(new PartesReclamoDTO(), parte).toReclamante());
    return new PartesReclamoDTOList(list);
  }

  toCreateManyInput(): PartesReclamosCreateManyReclamoInput[] {
    const result: PartesReclamosCreateManyReclamoInput[] = [];
    this.forEach((item) => {
      result.push({
        idParte: item.idParte,
        rol: item.rol,
        incomparendo: item.incomparendo,
        multado: item.multado,
        nroWhatsappParte: item.nroWhatsappParte,
        nroWhatsappPatrocinante: item.nroWhatsappParte,
        postergo: item.postergo,
      });
    });
    return result;
  }

  private intersectPartesReclamos(partesReclamos: PartesReclamosList, rol: number): PartesReclamoDTOList {
    const result = this.filter((parte) => partesReclamos.contains(parte.idParte, rol));
    return new PartesReclamoDTOList(result);
  }

  intersectReclamados(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.intersectPartesReclamos(partesReclamos, RECLAMADO);
  }

  intersectReclamantes(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.intersectPartesReclamos(partesReclamos, RECLAMANTE);
  }

  private toUpdatedList(partesReclamos: PartesReclamosList, rol: number): PartesReclamosList {
    return this.map((p) => {
      const obj = Object.assign(new PartesReclamosList(), p);
      const parte = partesReclamos.findParteByRol(obj.idParte, rol);
      if (!parte) return;
      return obj.update(parte);
    }) as PartesReclamosList;
  }

  toReclamadosUpdatedList(partesReclamos: PartesReclamosList): PartesReclamosList {
    const list = this.toUpdatedList(partesReclamos, RECLAMADO);
    const result = Object.assign(new PartesReclamosList(), list);
    return result;
  }

  toReclamantesUpdatedList(partesReclamos: PartesReclamosList): PartesReclamosList {
    return this.toUpdatedList(partesReclamos, RECLAMANTE);
  }

  existsReclamado(idParte: number) {
    return this?.some((p) => p.idParte === idParte && p.rol === RECLAMADO);
  }

  existsReclamante(idParte: number) {
    return this?.some((p) => p.idParte === idParte && p.rol === RECLAMANTE);
  }
}
