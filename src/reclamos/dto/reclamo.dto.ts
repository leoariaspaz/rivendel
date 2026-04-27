import { ApiProperty } from "@nestjs/swagger/dist";

export class ReclamoDto {
	@ApiProperty({ example: 1, description: 'ID del reclamo' })
  id!: number;

	@ApiProperty({ example: 123, description: 'Número del reclamo' })
  numero!: number;

	@ApiProperty({ example: '2024-01-01T10:00:00Z', description: 'Fecha y hora de inicio del reclamo' })
  fechaHoraInicio!: Date;

	@ApiProperty({ example: '2024-01-01T12:00:00Z', description: 'Fecha y hora de fin del reclamo' })
  horaFin?: Date | null;

	@ApiProperty({ example: 'Reclamo por servicio deficiente.', description: 'Descripción del reclamo' })
  rubros?: string;

	@ApiProperty({ example: '2024-02-01T10:00:00Z', description: 'Fecha y hora de la próxima audiencia' })
  proximaAudiencia?: Date | null;

	@ApiProperty({ example: 1, description: 'ID de la resolución asociada al reclamo' })
  idResolucion!: number;
}
