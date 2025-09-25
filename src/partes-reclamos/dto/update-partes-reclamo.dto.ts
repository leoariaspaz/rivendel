import { PartialType } from '@nestjs/mapped-types';
import { CreatePartesReclamoDto } from './create-partes-reclamo.dto';

export class UpdatePartesReclamoDto extends PartialType(CreatePartesReclamoDto) {}
