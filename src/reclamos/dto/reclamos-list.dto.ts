import { ApiProperty } from '@nestjs/swagger';
import { ReclamosListItemDTO } from './reclamos-list-item.dto';
import { FRACASO } from 'src/resoluciones/resoluciones.constants';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';

export class ReclamosListDto {
  constructor(partes: ReclamosListItemDTO[], totalRecords: number) {
    this.data = partes;
    this.totalRecords = totalRecords;
  }

  @ApiProperty({
    description: 'Lista obtenida de reclamos',
    example: {
      id: 1,
      numero: 123,
      fechaHoraInicio: '2024-01-01T17:00:00Z',
      horaFin: '2024-01-01T17:15:00Z',
      idResolucion: 1,
      resolucion: FRACASO,
      proximaAudiencia: null,
      partes: [
        {
          rol: RECLAMANTE,
          parte: {
            id: 1,
            nombre: 'Juan Pérez',
            cuil: '20121231238',
          },
        },
        {
          rol: RECLAMADO,
          parte: {
            id: 2,
            nombre: 'Empresa XYZ',
            cuil: '30654321098',
          },
        },
      ],
    },
  })
  data!: ReclamosListItemDTO[];

  @ApiProperty({ description: 'Cantidad total de registros que coinciden con la búsqueda', example: 100 })
  totalRecords!: number;
}
