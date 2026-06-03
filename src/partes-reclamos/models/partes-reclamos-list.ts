import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesReclamoDTOList } from '../dto/partes-reclamos-dto-list';
import { Logger } from '@nestjs/common';

export class PartesReclamosList extends Array<PartesReclamos> {
  private readonly logger = new Logger();

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

  debug(s: string | undefined = undefined) {
    this.logger.debug(s || 'debug', this.all);
    return this;
  }

  findParteByRol(idParte: number, rol: number): PartesReclamos | undefined {
    return this.find((p) => p.idParte === idParte && p.rol === rol);
  }

  private subtractReclamados(partes: PartesReclamoDTOList | undefined): PartesReclamosList {
    return new PartesReclamosList(this.filter((p) => !partes?.existsReclamado(p.idParte)));
  }

  private subtractReclamantes(partes: PartesReclamoDTOList | undefined): PartesReclamosList {
    return new PartesReclamosList(this.filter((p) => !partes?.existsReclamante(p.idParte)));
  }

  getRemovedPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList | undefined {
    const reclamadosList = this.subtractReclamados(reclamados);
    const reclamantesList = this.subtractReclamantes(reclamantes);
    return reclamadosList?.joinPartes(reclamantesList);
  }
}
