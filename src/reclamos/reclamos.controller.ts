import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { RECLAMADO, RECLAMANTE } from 'src/shared/utils/constants';

@Controller('reclamos')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  @Post()
  create(@Body() createReclamoDto: CreateReclamoDto) {
    return this.reclamosService.create(createReclamoDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null,
  ) {
    if (page && limit) {
      const totalRecords = await this.reclamosService.getTotalCount();
      const data = await this.reclamosService.findAll({ page, limit });
      return { data, totalRecords };
    }
    return await this.reclamosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reclamo = await this.reclamosService.findOne(+id);
    const result = {
      id: reclamo?.id,
      numero: reclamo?.numero,
      rubros: reclamo?.rubros,
      resolucion: reclamo?.resolucion.detalle,
      fechaHoraInicio: reclamo?.fechaHoraInicio,
      horaFin: reclamo?.horaFin,
      reclamantes: reclamo?.partes
        .filter((p) => p.rol === RECLAMANTE)
        .map((p) => p.parte),
      reclamados: reclamo?.partes
        .filter((p) => p.rol === RECLAMADO)
        .map((p) => p.parte),
    }
    return result;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReclamoDto: UpdateReclamoDto) {
    return this.reclamosService.update(+id, updateReclamoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reclamosService.remove(+id);
  }
}
