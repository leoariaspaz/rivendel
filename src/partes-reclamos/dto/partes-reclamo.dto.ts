import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesService } from 'src/partes/partes.service';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { ValidateRelation } from 'src/validators/ValidateRelationConstraint';

export class PartesReclamoDTO {
  @IsInt({ message: 'Una parte es incorrecta.' })
  @IsPositive({ message: 'El valor de una parte es incorrecta.' })
  @ValidateRelation(PartesService)
  idParte!: number;

  @IsInt({ message: 'Un tipo de rol es incorrecto.' })
  @IsPositive({ message: 'Un rol es incorrecto.' })
  @IsIn([RECLAMANTE, RECLAMADO], { message: 'El rol de una parte es incorrecto.' })
  rol!: number;

  @IsOptional()
  @IsString({ message: 'El número de whatsapp de una parte es incorrecto.' })
  nroWhatsappParte?: string | null;

  @IsOptional()
  @IsString({ message: 'El número de whatsapp de una parte es incorrecto.' })
  nroWhatsappPatrocinante?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'El valor de postergo debe ser verdadero o falso.' })
  postergo?: boolean;

  @Type(() => Boolean)
  incomparendo?: boolean;

  @Type(() => Boolean)
  multado?: boolean;

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

  toReclamado(): PartesReclamos {
    return this.toPartesReclamos(this, RECLAMADO);
  }

  toReclamante(): PartesReclamos {
    return this.toPartesReclamos(this, RECLAMANTE);
  }

  update(p: PartesReclamos): PartesReclamos {
    p.incomparendo = this.incomparendo || false;
    p.multado = this.multado || false;
    p.nroWhatsappParte = this.nroWhatsappParte || null;
    p.nroWhatsappPatrocinante = this.nroWhatsappPatrocinante || null;
    p.postergo = this.postergo || false;
    return p;
  }
}
