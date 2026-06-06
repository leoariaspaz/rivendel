import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesReclamoDTOList } from '../dto/partes-reclamos-dto-list';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';

export class PartesReclamosList extends Array<PartesReclamos> {
  constructor(private items: PartesReclamos[] = []) {
    super(...Array.from(items || []));
  }

  contains(idParte: number, rol: number): boolean {
    return this.items.some((p) => p.idParte === idParte && p.rol === rol);
  }

  get all() {
    return this.items;
  }

  joinPartes(partes: PartesReclamosList | undefined): PartesReclamosList {
    const join = [...this, ...(partes?.all || [])];
    return new PartesReclamosList(join);
  }

  findParteByRol(idParte: number, rol: number): PartesReclamos | undefined {
    return this.find((p) => p.idParte === idParte && p.rol === rol);
  }

  private getPartesByRol(rol: number): PartesReclamosList {
    const result = this.filter((p) => p.rol === rol);
    return new PartesReclamosList(result);
  }

  private notExistsReclamados(dtoList: PartesReclamoDTOList | undefined): PartesReclamosList {
    const result = this.filter((p) => !dtoList?.existsReclamado(p.idParte));
    return new PartesReclamosList(result);
  }

  private notExistsReclamantes(dtoList: PartesReclamoDTOList | undefined): PartesReclamosList {
    const result = this.filter((p) => !dtoList?.existsReclamante(p.idParte));
    return new PartesReclamosList(result);
  }

  subtractReclamados(reclamados: PartesReclamoDTOList | undefined): PartesReclamosList {
    return this.getPartesByRol(RECLAMADO).notExistsReclamados(reclamados);
  }

  subtractReclamantes(reclamantes: PartesReclamoDTOList | undefined): PartesReclamosList {
    return this.getPartesByRol(RECLAMANTE).notExistsReclamantes(reclamantes);
  }
}
