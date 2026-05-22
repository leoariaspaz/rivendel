import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesReclamoDTOList } from './partes-reclamos-dto-list.service';

export class PartesReclamosList extends Array<PartesReclamos> {
  constructor(private items: PartesReclamos[] = []) {
    super(...items);
  }

  contains(idParte: number, rol: number): boolean {
    return this.items.some((p) => p.idParte === idParte && p.rol === rol);
  }

  get all() {
    return this.items;
  }

  joinPartes(partes: PartesReclamosList | undefined): PartesReclamosList {
    return [...this, ...(partes?.all || [])] as PartesReclamosList;
  }

  getNewPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamos[] | undefined {
    const reclamadosList = reclamados?.subtractReclamados(this).toReclamadosList();
    const reclamantesList = reclamantes?.subtractReclamantes(this).toReclamantesList();
    return reclamadosList?.joinPartes(reclamantesList);
  }

  getUpdatedPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList | undefined {
    const reclamadosList = reclamados?.intersectReclamados(this).toReclamadosUpdatedList(this);
    const reclamantesList = reclamantes?.intersectReclamantes(this).toReclamantesUpdatedList(this);
    return reclamadosList?.joinPartes(reclamantesList);
  }

  findParteByRol(idParte: number, rol: number): PartesReclamos | undefined {
    return this.find((p) => p.idParte === idParte && p.rol === rol);
  }

  getRemovedPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList | undefined {
    // const partesToDelete = this.partesReclamosService
    //   .filterIfExists(RECLAMADO, reclamadosEnDB, reclamadosAGrabar)
    //   .concat(this.partesReclamosService.filterIfExists(RECLAMANTE, reclamantesEnDB, reclamantesAGrabar));

    const notExists = reclamados?.    
  }
}
