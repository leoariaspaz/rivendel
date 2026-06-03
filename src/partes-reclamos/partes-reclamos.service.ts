import { Injectable } from '@nestjs/common';
import { PartesReclamoDTOList } from './dto/partes-reclamos-dto-list';
import { PartesReclamosCreateManyReclamoInput } from 'src/generated/prisma/models';
import { PartesReclamosList } from './models/partes-reclamos-list';

@Injectable()
export class PartesReclamosService {
  getNewPartes(
    partesExistentes: PartesReclamosList,
    reclamados: PartesReclamoDTOList | undefined,
    reclamantes: PartesReclamoDTOList | undefined
  ): PartesReclamosCreateManyReclamoInput[] {
    const partes = [
      ...(reclamados?.subtractReclamados(partesExistentes).toReclamadosList() || []),
      ...(reclamantes?.subtractReclamantes(partesExistentes).toReclamantesList() || []),
    ] as PartesReclamoDTOList;
    return this.toCreateManyList(partes);
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
}
