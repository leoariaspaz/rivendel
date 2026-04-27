import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateReclamoDto } from '../dto/update-reclamo.dto';
import { CreateReclamoDto } from '../dto/create-reclamo.dto';
import { ReclamoDto } from '../dto/reclamo.dto';

export function ApiReclamoSave(operation: 'create' | 'update') {
  const isUpdate = operation === 'update';

  return applyDecorators(
    ApiOperation({ summary: isUpdate ? 'Actualiza un reclamo' : 'Crea un nuevo reclamo' }),
    ApiBody({
      type: isUpdate ? UpdateReclamoDto : CreateReclamoDto,
      examples: {
        valid: {
          summary: 'Ejemplo válido',
          value: {
            numero: 123,
            fechaHoraInicio: '2024-01-01T10:00:00Z',
            fechaHoraFin: '2024-01-01T12:00:00Z',
            descripcion: 'Reclamo por servicio deficiente.',
          },
        },
        duplicateNumeroFecha: {
          summary: 'Ejemplo con número de reclamo duplicado para la misma fecha',
          value: {
            numero: 123, // Mismo número que el ejemplo válido
            fechaHoraInicio: '2024-01-01T10:00:00Z', // Misma fecha que el ejemplo válido
            fechaHoraFin: '2024-01-01T12:00:00Z',
            descripcion: 'Intento de crear un reclamo con número y fecha ya existentes.',
          },
        },
        missingFields: {
          summary: 'Ejemplo con campos faltantes',
          value: {
            numero: 124,
            // Falta fechaHoraInicio, fechaHoraFin y descripción
          },
        },
        invalidDateFormat: {
          summary: 'Ejemplo con formato de fecha inválido',
          value: {
            numero: 125,
            fechaHoraInicio: '01-01-2024 10:00', // Formato de fecha no ISO
            fechaHoraFin: '01-01-2024 12:00', // Formato de fecha no ISO
            descripcion: 'Reclamo con formato de fecha inválido.',
          },
        },
        endBeforeStart: {
          summary: 'Ejemplo con fecha de fin antes de la fecha de inicio',
          value: {
            numero: 126,
            fechaHoraInicio: '2024-01-01T12:00:00Z',
            fechaHoraFin: '2024-01-01T10:00:00Z', // Fecha de fin antes de la fecha de inicio
            descripcion: 'Reclamo con fecha de fin anterior a la fecha de inicio.',
          },
        },
        invalidNumero: {
          summary: 'Ejemplo con número de reclamo no numérico',
          value: {
            numero: 'ABC', // Número no numérico
            fechaHoraInicio: '2024-01-01T10:00:00Z',
            fechaHoraFin: '2024-01-01T12:00:00Z',
            descripcion: 'Reclamo con número no numérico.',
          },
        },
      },
    }),
    ApiResponse({
      status: isUpdate ? 200 : 201,
      type: ReclamoDto,
      description: `Reclamo ${isUpdate ? 'actualizado' : 'creado'} exitosamente.`,
    }),
    ApiResponse({ status: 400, description: 'Número de reclamo ya existe para la fecha dada.' }),
    ...(isUpdate ? [ApiResponse({ status: 404, description: 'No encontrado' })] : [])
  );
}
