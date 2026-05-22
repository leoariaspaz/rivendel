import { PartesReclamos } from 'src/generated/prisma/browser';
import { PartesReclamoDTO } from 'src/reclamos/dto/partes-reclamo.dto';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';

export class PartesReclamoDTOService {
  private toPartesReclamos(dto: PartesReclamoDTO, rol: number): PartesReclamos {
    return {
      id: 0,
      idReclamo: 0,
      idParte: dto.idParte,
      rol: rol,
      nroWhatsappParte: dto.nroWhatsappParte || null,
      nroWhatsappPatrocinante: dto.nroWhatsappPatrocinante || null,
      postergo: dto.postergo || false,
      incomparendo: dto.incomparendo || false,
      multado: dto.multado || false,
    };
  }

  toReclamado(dto: PartesReclamoDTO): PartesReclamos {
    return this.toPartesReclamos(dto, RECLAMADO);
  }

  toReclamante(dto: PartesReclamoDTO): PartesReclamos {
    return this.toPartesReclamos(dto, RECLAMANTE);
  }
}
