import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  constructor(nombre?: string | null, nroHabilitacion?: number | null, googleCalendarConnected?: boolean) {
    this.nombre = nombre || '[Nombre no disponible]';
    this.nroHabilitacion = nroHabilitacion ?? null;
    this.googleCalendarConnected = googleCalendarConnected ?? false;
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

  @ApiProperty({
    description: 'Indica si el usuario tiene su cuenta de Google Calendar conectada',
    type: Boolean,
    example: true,
  })
  googleCalendarConnected?: boolean;
}
