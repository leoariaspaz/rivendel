import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger/dist';
import { PatrocinanteDto } from './dto/patrocinante.dto';
import { PatrocinantesListDto } from './dto/patrocinantes-list.dto';

@Controller('patrocinantes')
@ApiBearerAuth('access-token')
@ApiExtraModels(PatrocinanteDto)
export class PatrocinantesController {
  constructor(private readonly patrocinantesService: PatrocinantesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo patrocinante' })
  @ApiBody({
    type: CreatePatrocinanteDto,
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
    },
  })
  @ApiResponse({ status: 201, description: 'Patrocinante creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Ya existe un patrocinante con este número de matrícula.' })
  async create(@Body() createPatrocinanteDto: CreatePatrocinanteDto) {
    if (await this.patrocinantesService.isUnique({ nroMatricula: createPatrocinanteDto.nroMatricula })) {
      throw new BadRequestException(['Ya existe un patrocinante con este número de matrícula.']);
    }
    return this.patrocinantesService.create(createPatrocinanteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene una lista de patrocinantes con paginación y búsqueda' })
  @ApiQuery({ name: 'query', required: false, description: 'Término de búsqueda para filtrar por nombre o número de matrícula' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página para paginación (comienza en 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de registros por página para paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de patrocinantes obtenida exitosamente. Se incluye el total de registros para paginación.',
    type: PatrocinantesListDto,
  })
  async findAll(
    @Query('query') query: string | null = null,
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null
  ) {
    const result = new PatrocinantesListDto();
    result.totalRecords = await this.patrocinantesService.getTotalCount(query);
    result.data = await this.patrocinantesService.findAll(query, page, limit);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un patrocinante por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del patrocinante' })
  @ApiResponse({ status: 200, description: 'Patrocinante obtenido exitosamente.', type: PatrocinanteDto })
  @ApiResponse({ status: 404, description: 'Patrocinante no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.patrocinantesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un patrocinante por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del patrocinante a actualizar' })
  @ApiBody({
    type: UpdatePatrocinanteDto,
    examples: {
      valid: {
        summary: 'Ejemplo válido de actualización',
        value: {
          nombre: 'Juan Pérez Actualizado',
          nroMatricula: '654321',
          direccion: 'Calle Nueva 789',
          telefono: '555-4321',
          email: 'juanperez2@mail.com',
        },
      },
      duplicateMatricula: {
        summary: 'Ejemplo con número de matrícula duplicado',
        value: {
          nombre: 'María Gómez Actualizada',
          nroMatricula: '123456', // Mismo número de matrícula que el ejemplo de creación
          direccion: 'Avenida Siempre Viva 456',
          telefono: '555-5678',
          email: 'mariagomez@mail.com',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Patrocinante actualizado exitosamente.', type: PatrocinanteDto })
  @ApiResponse({ status: 400, description: 'Ya existe un patrocinante con este número de matrícula.' })
  @ApiResponse({ status: 404, description: 'Patrocinante no encontrado.' })
  async update(@Param('id') id: number, @Body() updatePatrocinanteDto: UpdatePatrocinanteDto) {
    if (!(await this.patrocinantesService.isUnique({ id, nroMatricula: updatePatrocinanteDto.nroMatricula }))) {
      throw new BadRequestException(['Ya existe un patrocinante con este número de matrícula.']);
    }
    return this.patrocinantesService.update(+id, updatePatrocinanteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un patrocinante por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del patrocinante a eliminar' })
  @ApiResponse({ status: 204, description: 'Patrocinante eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Patrocinante no encontrado.' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el patrocinante porque tiene datos relacionados.' })
  remove(@Param('id', ValidateIntRelationPipe(PatrocinantesService)) id: number) {
    return this.patrocinantesService.remove(id);
  }
}
