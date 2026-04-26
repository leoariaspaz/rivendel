import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TipdocsService } from './tipdocs.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger/dist';
import { TipoDocumento } from 'src/generated/prisma/client';
import { TipoDocumentoDto } from './dto/tipo-documento.dto';

@Controller('tipdocs')
@ApiTags('Tipos de Documentos')
@ApiExtraModels(TipoDocumentoDto)
@ApiBearerAuth('access-token')
export class TipdocsController {
  constructor(private readonly tipdocsService: TipdocsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo tipo de documento' })
  @ApiBody({
    type: CreateTipdocDto,
    examples: {
      valid: {
        summary: 'Ejemplo válido',
        value: {
          sintetico: 'DNI',
          descripcion: 'Documento Nacional de Identidad',
        },
      },
      duplicateSintetico: {
        summary: 'Ejemplo con sintético duplicado',
        value: {
          sintetico: 'DNI',
          descripcion: 'Otro tipo de documento con el mismo sintético',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tipo de documento creado exitosamente.', type: TipoDocumentoDto })
  @ApiResponse({ status: 400, description: 'Ya existe un tipo de documento con este sintético.' })
  async create(@Body() createTipdocDto: CreateTipdocDto) {
    if (await this.tipdocsService.isUnique({ sintetico: createTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.create(createTipdocDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los tipos de documentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de documentos obtenida exitosamente.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(TipoDocumentoDto) },
              description: 'Lista de tipos de documentos.',
              example: [
                {
                  id: 1,
                  sintetico: 'DNI',
                  descripcion: 'Documento Nacional de Identidad',
                },
                {
                  id: 2,
                  sintetico: 'LE',
                  descripcion: 'Libreta de Enrolamiento',
                },
              ],
            },
            totalRecords: {
              type: 'integer',
              description: 'Cantidad total de tipos de documentos disponibles.',
              example: 2,
            },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página para paginación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros por página para paginación',
  })
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    let data: TipoDocumento[];
    let totalRecords: number;
    if (page === null || limit === null) {
      data = await this.tipdocsService.findAll();
      totalRecords = data.length;
    } else {
      totalRecords = await this.tipdocsService.getTotalCount();
      data = await this.tipdocsService.findAllPaginated(page, limit);
    }
    return { data, totalRecords };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un tipo de documento por su ID' })
  @ApiResponse({ status: 200, description: 'Tipo de documento obtenido exitosamente.', type: TipoDocumentoDto })
  @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tipo de documento' })
  findOne(@Param('id') id: number) {
    return this.tipdocsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un tipo de documento por su ID' })
  @ApiResponse({ status: 200, description: 'Tipo de documento actualizado exitosamente.', type: TipoDocumentoDto })
  @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado.' })
  @ApiResponse({ status: 400, description: 'Ya existe un tipo de documento con este sintético.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tipo de documento a actualizar' })
  @ApiBody({
    type: UpdateTipdocDto,
    examples: {
      valid: {
        summary: 'Ejemplo válido',
        value: {
          sintetico: 'LE',
          descripcion: 'Libreta de Enrolamiento',
        },
      },
      duplicateSintetico: {
        summary: 'Ejemplo con sintético duplicado',
        value: {
          sintetico: 'DNI',
          descripcion: 'Intento de actualización con sintético ya existente',
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() updateTipdocDto: UpdateTipdocDto) {
    if (await this.tipdocsService.isUnique({ id, sintetico: updateTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.update(id, updateTipdocDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un tipo de documento por su ID' })
  @ApiResponse({ status: 204, description: 'Tipo de documento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado.' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar el tipo de documento porque tiene datos relacionados.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tipo de documento a eliminar' })
  async remove(@Param('id', ValidateIntRelationPipe(TipdocsService)) id: number): Promise<void> {
    await this.tipdocsService.remove(id);
  }
}
