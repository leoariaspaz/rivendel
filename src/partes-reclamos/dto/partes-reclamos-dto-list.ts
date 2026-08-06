import { PartesReclamoDTO } from 'src/partes-reclamos/dto/partes-reclamo.dto';
import { PartesReclamosList } from '../models/partes-reclamos-list';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { Prisma } from '@prisma/client';

export class PartesReclamoDTOList extends Array<PartesReclamoDTO> {
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

  toCreateManyInput(): Prisma.PartesReclamosCreateManyReclamoInput[] {
    const result: Prisma.PartesReclamosCreateManyReclamoInput[] = [];
    this.forEach((item) => {
      result.push({
        idParte: item.idParte,
        rol: item.rol,
        incomparendoParte: item.incomparendoParte,
        incomparendoPatrocinante: item.incomparendoPatrocinante,
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

  private updatePartesReclamos(partesReclamos: PartesReclamosList, rol: number): PartesReclamosList {
    return this.map((p) => {
      const parte = partesReclamos.findParteByRol(p.idParte, rol);
      if (!parte) return;
      return Object.assign(new PartesReclamoDTO(), p).update(parte);
    }) as PartesReclamosList;
  }

  updateReclamados(reclamados: PartesReclamosList): PartesReclamosList {
    return this.updatePartesReclamos(reclamados, RECLAMADO);
  }

  updateReclamantes(reclamantes: PartesReclamosList): PartesReclamosList {
    return this.updatePartesReclamos(reclamantes, RECLAMANTE);
  }

  existsReclamado(idParte: number) {
    return this?.some((p) => p.idParte === idParte);
  }

  existsReclamante(idParte: number) {
    return this?.some((p) => p.idParte === idParte);
  }
}
