import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PartesService } from './partes.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FindOneParteDTOListDTO } from './dto/find-one-parte-dto-list.dto';
import { ApiParteSave } from './decorators/partes-swagger.decorator';
import { GetUser } from 'src/users/decorators/get-user.decorator';

@Controller('partes')
@ApiBearerAuth('access-token')
export class PartesController {
  constructor(private readonly partesService: PartesService) {}

  @Post()
  @ApiParteSave('create')
  async create(@GetUser('userId') userId: number, @Body() createParteDto: CreateParteDto) {
    return this.partesService.create(userId, createParteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene una lista de partes con paginación y búsqueda' })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Término de búsqueda para filtrar por nombre o número de documento',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página para paginación (comienza en 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de registros por página para paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de partes obtenida exitosamente. Se incluye el total de registros para paginación.',
    type: FindOneParteDTOListDTO,
  })
  async findAll(
    @GetUser('userId') userId: number,
    @Query('query') query: string | null = null,
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null
  ): Promise<FindOneParteDTOListDTO> {
    const result = new FindOneParteDTOListDTO(
      await this.partesService.findAll(userId, query, page, limit),
      await this.partesService.getTotalCount(userId, query)
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una parte por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la parte' })
  @ApiResponse({ status: 200, description: 'Parte obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Parte no encontrada.' })
  findOne(@GetUser('userId') userId: number, @Param('id') id: number) {
    return this.partesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiParteSave('update')
  async update(@GetUser('userId') userId: number, @Param('id') id: number, @Body() updateParteDto: UpdateParteDto) {
    return this.partesService.update(userId, +id, updateParteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina una parte por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la parte a eliminar' })
  @ApiResponse({ status: 200, description: 'Parte eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Parte no encontrada.' })
  async remove(@GetUser('userId') userId: number, @Param('id', ValidateIntRelationPipe(PartesService)) id: number) {
    await this.partesService.remove(userId, id);
  }
}
