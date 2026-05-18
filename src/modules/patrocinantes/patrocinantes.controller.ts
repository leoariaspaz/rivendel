import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PatrocinanteDto } from './dto/patrocinante.dto';
import { PatrocinantesListDto } from './dto/patrocinantes-list.dto';
import { ApiPatrocinanteSave } from './decorators/patrocinantes-swagger.decorator';

@Controller('patrocinantes')
@ApiBearerAuth('access-token')
@ApiExtraModels(PatrocinanteDto)
export class PatrocinantesController {
  constructor(private readonly patrocinantesService: PatrocinantesService) {}

  @Post()
  @ApiPatrocinanteSave('create')
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
  @ApiPatrocinanteSave('update')
  async update(@Param('id') id: number, @Body() updatePatrocinanteDto: UpdatePatrocinanteDto) {
    if (!(await this.patrocinantesService.isUnique({ id, nroMatricula: updatePatrocinanteDto.nroMatricula }))) {
      throw new BadRequestException(['Ya existe un patrocinante con este número de matrícula.']);
    }
    return this.patrocinantesService.update(+id, updatePatrocinanteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un patrocinante por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del patrocinante a eliminar' })
  @ApiResponse({ status: 204, description: 'Patrocinante eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Patrocinante no encontrado.' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el patrocinante porque tiene datos relacionados.' })
  async remove(@Param('id', ValidateIntRelationPipe(PatrocinantesService)) id: number) {
    await this.patrocinantesService.remove(id);
  }
}
