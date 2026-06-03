import { Injectable } from '@nestjs/common';
import { PartesReclamoDTOList } from './dto/partes-reclamos-dto-list';
import { PartesReclamosCreateManyReclamoInput } from 'src/generated/prisma/models';
import { PartesReclamosList } from './models/partes-reclamos-list';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PartesReclamosService {
  getNew(
    partes: PartesReclamosList,
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosCreateManyReclamoInput[] {
    const newPartes = [
      ...(reclamados?.subtractReclamados(partes).toReclamadosList() || []),
      ...(reclamantes?.subtractReclamantes(partes).toReclamantesList() || []),
    ] as PartesReclamoDTOList;
    return this.toCreateManyList(newPartes);
  }

  private toCreateManyList(partes: PartesReclamoDTOList): PartesReclamosCreateManyReclamoInput[] {
    const result = [] as PartesReclamosCreateManyReclamoInput[];
    partes.forEach((parte) => {
      result.push({
        idParte: parte.idParte,
        rol: parte.rol,
        nroWhatsappParte: parte.nroWhatsappParte || null,
        nroWhatsappPatrocinante: parte.nroWhatsappPatrocinante || null,
        postergo: parte.postergo || false,
        incomparendo: parte.incomparendo || false,
        multado: parte.multado || false,
      });
    });
    return result;
  }

  getUpdated(
    partes: PartesReclamosList,
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosList | undefined {
    const reclamadosUpdated = reclamados?.intersectReclamados(partes).updateReclamados(partes);
    const reclamantesUpdated = reclamantes?.intersectReclamantes(partes).updateReclamantes(partes);
    return [...(reclamadosUpdated || []), ...(reclamantesUpdated || [])] as PartesReclamosList;
  }

  /** Devuelve un array de operaciones de actualización para los partes que ya existen en la base de datos y fueron modificados en el DTO.
   * @param partes Lista de partes que ya existen en la base de datos y fueron modificados por el DTO.
   * @returns Un array de operaciones de actualización para los partes que ya existen en la base de datos y fueron modificados en el DTO.
   */
  update(prismaService: PrismaService, partes: PartesReclamosList | undefined): any[] {
    if (!partes) return [];

    const updateMany: any[] = [];
    partes.forEach((p) => {
      console.log('updateMany parte ', JSON.stringify(p, null, ''));

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
