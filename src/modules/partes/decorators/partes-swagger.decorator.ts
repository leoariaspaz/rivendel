import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateParteDto } from '../dto/update-parte.dto';
import { CreateParteDto } from '../dto/create-parte.dto';
import { ParteDto } from '../dto/parte.dto';

export function ApiParteSave(operation: 'create' | 'update') {
  const isUpdate = operation === 'update';

  return applyDecorators(
    ApiOperation({ summary: isUpdate ? 'Actualiza una parte' : 'Crea una parte' }),
    ApiBody({
      type: isUpdate ? UpdateParteDto : CreateParteDto,
      examples: {
        valid: {
          summary: 'Ejemplo válido',
          value: {
            nombre: 'Juan Pérez',
            nroDocumento: '12345678',
            direccion: 'Calle Falsa 123',
            telefono: '555-1234',
            email: 'juanperez@mail.com',
          },
        },
        duplicateNroDocumento: {
          summary: 'Ejemplo con número de documento duplicado',
          value: {
            nombre: 'María Gómez',
            nroDocumento: '12345678', // Mismo número de documento que el ejemplo válido
            direccion: 'Avenida Siempre Viva 456',
            telefono: '555-5678',
            email: 'mariagomez@mail.com',
          },
        },
        invalidEmail: {
          summary: 'Ejemplo con email inválido',
          value: {
            nombre: 'Carlos López',
            nroDocumento: '87654321',
            direccion: 'Boulevard de los Sueños Rotos 789',
            telefono: '555-6789',
            email: 'carloslopez-at-mail.com', // Email sin formato correcto
          },
        },
        missingFields: {
          summary: 'Ejemplo con campos faltantes',
          value: {
            nombre: 'Ana Martínez',
            nroDocumento: '11223344',
            // Falta dirección, teléfono y email
          },
        },
        invalidPhoneNumber: {
          summary: 'Ejemplo con número de teléfono inválido',
          value: {
            nombre: 'Luis Fernández',
            nroDocumento: '44332211',
            direccion: 'Calle del Olvido 321',
            telefono: 'abc-1234', // Número de teléfono con formato inválido
            email: 'lfer@mail.com',
          },
        },
        emptyName: {
          summary: 'Ejemplo con nombre vacío',
          value: {
            nombre: '', // Nombre vacío
            nroDocumento: '55667788',
            direccion: 'Avenida del Silencio 654',
            telefono: '555-4321',
            email: '', // Email vacío
          },
        },
        invalidNroDocumento: {
          summary: 'Ejemplo con número de documento inválido',
          value: {
            nombre: 'Sofía Ramírez',
            nroDocumento: '12AB5678', // Número de documento con caracteres no numéricos
            direccion: 'Calle del Viento 987',
            telefono: '555-8765',
            email: 'sramirez@mail.com',
          },
        },
      },
    }),
    ApiResponse({
      status: isUpdate ? 200 : 201,
      type: ParteDto,
      description: `Parte ${isUpdate ? 'actualizada' : 'creada'} exitosamente.`,
    }),
    ApiResponse({ status: 400, description: 'Ya existe una parte con este número de documento.' }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' }),
    ApiResponse({ status: 400, description: 'No existen los datos relacionados.' }),
    ...(isUpdate ? [ApiResponse({ status: 404, description: 'No encontrada' })] : [])
  );
}
