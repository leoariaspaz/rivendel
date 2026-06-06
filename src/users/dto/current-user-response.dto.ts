import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  constructor(nombre?: string | null, nroHabilitacion?: number | null) {
    this.nombre = nombre || '[Nombre no disponible]';
    this.nroHabilitacion = nroHabilitacion ?? null;
  }

  @ApiProperty({ description: 'Nombre del usuario autenticado', type: String, example: 'Juan Pérez', nullable: true })
  nombre?: string | null | undefined;

  @ApiProperty({
    description: 'Número de habilitación del usuario autenticado',
    type: Number,
    example: 1234,
    nullable: true,
  })
  nroHabilitacion?: number | null | undefined;
}
