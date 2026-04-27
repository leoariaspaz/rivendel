import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PartesService } from 'src/modules/partes/partes.service';
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
}
