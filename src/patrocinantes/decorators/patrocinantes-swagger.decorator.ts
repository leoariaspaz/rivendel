import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdatePatrocinanteDto } from '../dto/update-patrocinante.dto';
import { CreatePatrocinanteDto } from '../dto/create-patrocinante.dto';
import { PatrocinanteDto } from '../dto/patrocinante.dto';

export function ApiPatrocinanteSave(operation: 'create' | 'update') {
  const isUpdate = operation === 'update';

  return applyDecorators(
    ApiOperation({ summary: isUpdate ? 'Actualiza un patrocinante.' : 'Crea un nuevo patrocinante.' }),
    ApiBody({
      type: isUpdate ? UpdatePatrocinanteDto : CreatePatrocinanteDto,
      examples: {
        valid: {
          summary: 'Ejemplo válido',
          value: {
            nombre: 'Juan Pérez',
            nroMatricula: '123456',
            direccion: 'Calle Falsa 123',
            telefono: '555-1234',
            email: 'juanperez@mail.com',
          },
        },
        duplicateMatricula: {
          summary: 'Ejemplo con número de matrícula duplicado',
          value: {
            nombre: 'María Gómez',
            nroMatricula: '123456', // Mismo número de matrícula que el ejemplo válido
            direccion: 'Avenida Siempre Viva 456',
            telefono: '555-5678',
            email: 'mariagomez@mail.com',
          },
        },
        invalidEmail: {
          summary: 'Ejemplo con email inválido',
          value: {
            nombre: 'Carlos López',
            nroMatricula: '654321',
            direccion: 'Boulevard de los Sueños Rotos 789',
            telefono: '555-6789',
            email: 'carloslopez-at-mail.com', // Email sin formato correcto
          },
        },
        missingFields: {
          summary: 'Ejemplo con campos faltantes',
          value: {
            nombre: 'Ana Martínez',
            nroMatricula: '112233',
            // Falta dirección, teléfono y email
          },
        },
        invalidPhoneNumber: {
          summary: 'Ejemplo con número de teléfono inválido',
          value: {
            nombre: 'Luis Fernández',
            nroMatricula: '443322',
            direccion: 'Calle del Olvido 321',
            telefono: 'abc-1234', // Número de teléfono con formato inválido
            email: 'lfer@mail.com',
          },
        },
      },
    }),
    ApiResponse({
      status: isUpdate ? 200 : 201,
      type: PatrocinanteDto,
      description: `Patrocinante ${isUpdate ? 'actualizado' : 'creado'} exitosamente.`,
    }),
    ApiResponse({ status: 400, description: 'Ya existe un patrocinante con este número de matrícula.' }),
    ApiResponse({ status: 400, description: 'No existen los datos relacionados.' }),
    ...(isUpdate ? [ApiResponse({ status: 404, description: 'No encontrado' })] : [])
  );
}
