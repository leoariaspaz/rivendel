import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator/types';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { MustExistParte } from 'src/validators/MustExistParte';

export class PartesReclamoDTO {
  @IsInt({ message: 'Una parte es incorrecta.' })
  @IsPositive({ message: 'El valor de una parte es incorrecta.' })
  @MustExistParte()
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
}
