import { PartialType } from '@nestjs/mapped-types';
import { CreateTipdocDto } from './create-tipdoc.dto';

export class UpdateTipdocDto extends PartialType(CreateTipdocDto) {
  sintetico?: string | undefined;
  descripcion?: string | undefined;
}
