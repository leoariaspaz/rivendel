import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger/dist';
import { ApiReclamoSave } from './decorators/reclamos-swagger.decorator';
import { ReclamoDto } from './dto/reclamo.dto';

@Controller('reclamos')
@ApiTags('Reclamos')
@ApiBearerAuth('access-token')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  @Post()
  @ApiReclamoSave('create')
  async create(@Body() createReclamoDto: CreateReclamoDto) {
    const filter = {
      numero: createReclamoDto.numero,
      fecha: createReclamoDto.fechaHoraInicio,
    };
    if (!(await this.reclamosService.isUnique(filter))) {
      throw new BadRequestException([
        `Ya existe un reclamo Nº ${createReclamoDto.numero} para la fecha ${createReclamoDto.fechaHoraInicio}.`,
      ]);
    }
    return this.reclamosService.create(createReclamoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene una lista de reclamos con paginación y búsqueda' })
  @ApiQuery({ name: 'query', required: false, description: 'Término de búsqueda para filtrar por número o descripción' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página para paginación (comienza en 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de registros por página para paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de reclamos obtenida exitosamente. Se incluye el total de registros para paginación.',
    type: [ReclamoDto],
  })
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    if (page && limit) {
      const totalRecords = await this.reclamosService.getTotalCount();
      const data = await this.reclamosService.findAll({ page, limit });
      return { data, totalRecords };
    }
    return await this.reclamosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un reclamo por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del reclamo' })
  @ApiResponse({ status: 200, description: 'Reclamo obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado.' })
  async findOne(@Param('id') id: number) {
    const getResult = (p) => {
      return {
        ...p.parte,
        nroWhatsappParte: p.nroWhatsappParte,
        nroWhatsappPatrocinante: p.nroWhatsappPatrocinante,
        postergo: p.postergo,
        incomparendo: p.incomparendo,
        multado: p.multado,
      };
    };
    const reclamo = await this.reclamosService.findOne(id);
    const cantidad = await this.reclamosService.count(reclamo?.numero?? 0, reclamo?.fechaHoraInicio);
    if (reclamo) {
      const { partes, ...result } = reclamo;
      return {
        ...result,
        reclamantes: reclamo?.partes.filter((p) => p.rol === RECLAMANTE).map(getResult),
        reclamados: reclamo?.partes.filter((p) => p.rol === RECLAMADO).map(getResult),
        cantidad
      };
    }
    return null;
  }

  @Patch(':id')
  @ApiReclamoSave('update')  
  async update(@Param('id') id: number, @Body() updateReclamoDto: UpdateReclamoDto) {
    const filter = {
      id,
      numero: updateReclamoDto.numero,
      fecha: updateReclamoDto.fechaHoraInicio,
    };
    if (!(await this.reclamosService.isUnique(filter))) {
      throw new BadRequestException([
        `Ya existe un reclamo Nº ${updateReclamoDto.numero} para la fecha ${updateReclamoDto.fechaHoraInicio}.`,
      ]);
    }
    return this.reclamosService.update(+id, updateReclamoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un reclamo por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del reclamo a eliminar' })
  @ApiResponse({ status: 204, description: 'Reclamo eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado.' })
  remove(@Param('id') id: string) {
    return this.reclamosService.remove(+id);
  }
}
