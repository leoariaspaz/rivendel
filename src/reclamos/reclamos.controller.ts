import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';

@Controller('reclamos')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

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
  async findOne(@Param('id') id: string) {
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
    const reclamo = await this.reclamosService.findOne(+id);
    // const result = {
    //   id: reclamo?.id,
    //   numero: reclamo?.numero,
    //   rubros: reclamo?.rubros,
    //   fechaHoraInicio: reclamo?.fechaHoraInicio,
    //   horaFin: reclamo?.horaFin,
    //   idResolucion: reclamo?.idResolucion,
    //   proximaAudiencia: reclamo?.proximaAudiencia,
    //   incomparendo: reclamo?.incomparendo,
    //   multado: reclamo?.multado,
    //   reclamantes: reclamo?.partes.filter((p) => p.rol === RECLAMANTE).map(getResult),
    //   reclamados: reclamo?.partes.filter((p) => p.rol === RECLAMADO).map(getResult),
    // };
    // return result;

    return {
      ...reclamo,
      reclamantes: reclamo?.partes.filter((p) => p.rol === RECLAMANTE).map(getResult),
      reclamados: reclamo?.partes.filter((p) => p.rol === RECLAMADO).map(getResult),
    };
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
