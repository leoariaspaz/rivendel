import { ApiProperty } from '@nestjs/swagger';
import { FindOneParteDTO } from './find-one-parte.dto';

export class FindOneParteDTOListDTO {
  constructor(partes: FindOneParteDTO[], totalRecords: number) {
    this.data = partes;
    this.totalRecords = totalRecords;
  }

  @ApiProperty({ description: 'Lista de partes obtenida' })
  data!: FindOneParteDTO[];

  @ApiProperty({ description: 'Total de registros que coinciden con la búsqueda' })
  totalRecords!: number;
}
