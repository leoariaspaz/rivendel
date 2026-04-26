import { ApiProperty } from '@nestjs/swagger/dist';
import { PatrocinanteDto } from './patrocinante.dto';

export class PatrocinantesListDto {
  @ApiProperty({ type: [PatrocinanteDto], description: 'Lista de patrocinantes obtenida' })
  data!: PatrocinanteDto[];

  @ApiProperty({
    type: Number,
    description: 'Total de registros que coinciden con la búsqueda (sin paginar)',
    example: 45,
  })
  totalRecords!: number;
}
