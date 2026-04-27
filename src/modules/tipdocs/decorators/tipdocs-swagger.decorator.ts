import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TipoDocumentoDto } from '../dto/tipo-documento.dto';
import { UpdateTipdocDto } from '../dto/update-tipdoc.dto';
import { CreateTipdocDto } from '../dto/create-tipdoc.dto';

export function ApiTipdocSave(operation: 'create' | 'update') {
  const isUpdate = operation === 'update';

  return applyDecorators(
    ApiOperation({ summary: isUpdate ? 'Actualiza un tipo de documento' : 'Crea un nuevo tipo de documento' }),
    ApiBody({
      type: isUpdate ? UpdateTipdocDto : CreateTipdocDto,
      examples: {
        valid: {
          summary: 'Ejemplo válido',
          value: { sintetico: 'DNI', descripcion: 'Documento Nacional de Identidad' },
        },
        duplicate: {
          summary: 'Error: Sintético duplicado',
          value: { sintetico: 'DNI', descripcion: 'Intento de duplicado' },
        },
        missingFields: {
          summary: 'Error: Campos faltantes',
          value: { sintetico: '', descripcion: '' },
        },
        invalidSintetico: {
          summary: 'Error: Sintético no es una cadena de texto',
          value: { sintetico: 12345, descripcion: 'Número en lugar de texto' },
        },
      },
    }),
    ApiResponse({
      status: isUpdate ? 200 : 201,
      type: TipoDocumentoDto,
      description: `Tipo de documento ${isUpdate ? 'actualizado' : 'creado'} exitosamente.`,
    }),
    ApiResponse({ status: 400, description: 'Ya existe un tipo de documento con este sintético.' }),
    ...(isUpdate ? [ApiResponse({ status: 404, description: 'No encontrado' })] : [])
  );
}
