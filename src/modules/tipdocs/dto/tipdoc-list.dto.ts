import { ApiProperty } from '@nestjs/swagger/dist';
import { TipoDocumentoDto } from './tipo-documento.dto';

export class TipDocListDto {
  @ApiProperty({ type: [TipoDocumentoDto], description: 'Lista de tipos de documentos obtenida' })
  data!: TipoDocumentoDto[];

  @ApiProperty({
    type: Number,
    description: 'Total de registros que coinciden con la búsqueda (sin paginar)',
    example: 15,
  })
  totalRecords!: number;
}
