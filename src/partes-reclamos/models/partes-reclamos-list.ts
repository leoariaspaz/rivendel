import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesReclamoDTOList } from '../dto/partes-reclamos-dto-list';
import { PrismaService } from 'src/shared/services/prisma.service';

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
  ): PartesReclamosList {
    return new PartesReclamosList()
      .joinPartes(reclamados?.subtractReclamados(this).toReclamadosList())
      .joinPartes(reclamantes?.subtractReclamantes(this).toReclamantesList());
  }

  getUpdatedPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList {
    const reclamadosList = reclamados?.intersectReclamados(this).toReclamadosUpdatedList(this);
    const reclamantesList = reclamantes?.intersectReclamantes(this).toReclamantesUpdatedList(this);
    return reclamadosList?.joinPartes(reclamantesList) || new PartesReclamosList();
  }

  findParteByRol(idParte: number, rol: number): PartesReclamos | undefined {
    return this.find((p) => p.idParte === idParte && p.rol === rol);
  }

  private subtractReclamados(partes: PartesReclamoDTOList | undefined): PartesReclamosList {
    return this.filter((p) => !partes?.existsReclamado(p.idParte)) as PartesReclamosList;
  }

  private subtractReclamantes(partes: PartesReclamoDTOList | undefined): PartesReclamosList {
    return this.filter((p) => !partes?.existsReclamante(p.idParte)) as PartesReclamosList;
  }

  getRemovedPartes(
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList | undefined {
    return this.subtractReclamados(reclamados).joinPartes(this.subtractReclamantes(reclamantes));
  }

  update(prismaService: PrismaService): any[] {
    const updateMany: any[] = [];
    this.forEach((p) => {
      const parte = prismaService.partesReclamos.update({
        where: { id: p.id },
        data: {
          rol: p.rol,
          nroWhatsappParte: p.nroWhatsappParte,
          nroWhatsappPatrocinante: p.nroWhatsappPatrocinante,
          postergo: p.postergo,
          incomparendo: p.incomparendo,
          multado: p.multado,
        },
      });
      updateMany.push(parte);
    });
    return updateMany;
  }
}
