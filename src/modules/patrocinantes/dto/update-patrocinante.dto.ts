import { PartialType } from '@nestjs/mapped-types';
import { CreatePatrocinanteDto } from './create-patrocinante.dto';

export class UpdatePatrocinanteDto extends PartialType(CreatePatrocinanteDto) {}
