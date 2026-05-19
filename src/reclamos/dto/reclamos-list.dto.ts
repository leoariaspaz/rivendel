import { ApiProperty } from '@nestjs/swagger';
import { ReclamosListItemDTO } from './reclamos-list-item.dto';

export class ReclamosListDto {
  constructor(partes: ReclamosListItemDTO[], totalRecords: number) {
    this.data = partes;
    this.totalRecords = totalRecords;
  }

  @ApiProperty({ description: 'Lista obtenida de reclamos' })
  data!: ReclamosListItemDTO[];

  @ApiProperty({ description: 'Total de registros que coinciden con la búsqueda' })
  totalRecords!: number;
}
