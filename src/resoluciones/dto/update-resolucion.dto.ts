import { PartialType } from '@nestjs/mapped-types';
import { CreateResolucionDto } from './create-resolucion.dto';

export class UpdateResolucionDto extends PartialType(CreateResolucionDto) {}
