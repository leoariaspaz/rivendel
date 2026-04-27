import { ApiProperty } from '@nestjs/swagger/dist';

export class CurrentUserResponseDto {
  constructor(nombre: string | null | undefined) {
    this.nombre = nombre || "[Nombre no disponible]";
  }

  @ApiProperty({ description: 'Nombre del usuario autenticado', type: String, example: 'Juan Pérez', nullable: true })
  nombre?: string | null | undefined;
}
