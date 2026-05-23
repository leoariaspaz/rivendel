import { PartesReclamoDTO } from 'src/partes-reclamos/dto/partes-reclamo.dto';
import { PartesReclamosList } from './partes-reclamos-list';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { PartesReclamosExtensions } from './partes-reclamos.extension';

export class PartesReclamoDTOList extends Array<PartesReclamoDTO> {
  private subtractPartesReclamos(partesReclamos: PartesReclamosList, rol: number): PartesReclamoDTOList {
    const result = this.filter((parte) => !partesReclamos.contains(parte.idParte, rol));
    return new PartesReclamoDTOList(...result);
  }

  subtractReclamados(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.subtractPartesReclamos(partesReclamos, RECLAMADO);
  }

  subtractReclamantes(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.subtractPartesReclamos(partesReclamos, RECLAMANTE);
  }

  toReclamadosList(): PartesReclamosList {
    return this.map((parte) => {
      return parte.toReclamado();
    }) as PartesReclamosList;
  }

  toReclamantesList(): PartesReclamosList {
    return this.map((parte) => {
      return parte.toReclamante();
    }) as PartesReclamosList;
  }

  private intersectPartesReclamos(partesReclamos: PartesReclamosList, rol: number): PartesReclamoDTOList {
    const result = this.filter((parte) => partesReclamos.contains(parte.idParte, rol));
    return new PartesReclamoDTOList(...result);
  }

  intersectReclamados(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.intersectPartesReclamos(partesReclamos, RECLAMADO);
  }

  intersectReclamantes(partesReclamos: PartesReclamosList): PartesReclamoDTOList {
    return this.intersectPartesReclamos(partesReclamos, RECLAMANTE);
  }

  private toUpdatedList(partesReclamos: PartesReclamosList, rol: number): PartesReclamosList {
    return this.map((p) => {
      const parte = partesReclamos.findParteByRol(p.idParte, rol);
      if (!parte) return;
      return new PartesReclamosExtensions(parte).updateWith(p);
    }) as PartesReclamosList;
  }

  toReclamadosUpdatedList(partesReclamos: PartesReclamosList): PartesReclamosList {
    return this.toUpdatedList(partesReclamos, RECLAMADO);
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
