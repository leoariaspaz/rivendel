import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger/dist';

@ApiTags('Reclamos')
@Controller('reclamos')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  @ApiOperation({ summary: 'Crea un nuevo reclamo' })
  @ApiResponse({ status: 201, description: 'Reclamo creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Número de reclamo ya existe para la fecha dada.' })
  @Post()
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
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    if (page && limit) {
      const totalRecords = await this.reclamosService.getTotalCount();
      const data = await this.reclamosService.findAll({ page, limit });
      return { data, totalRecords };
    }
    return await this.reclamosService.findAll();
  }

  @Get(':id')
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
  remove(@Param('id') id: string) {
    return this.reclamosService.remove(+id);
  }
}
