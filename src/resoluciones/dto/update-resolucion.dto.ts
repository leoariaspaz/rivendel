import { PartialType } from '@nestjs/mapped-types';
import { CreateResolucionDto } from './create-resolucion.dto';

export class UpdateResolucioneDto extends PartialType(CreateResolucionDto) {}
