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
import { ResolucionesService } from './resoluciones.service';
import { CreateResolucionDto } from './dto/create-resolucion.dto';
import { UpdateResolucioneDto } from './dto/update-resolucion.dto';

@Controller('resoluciones')
export class ResolucionesController {
  constructor(private readonly resolucionesService: ResolucionesService) {}

  @Post()
  create(@Body() createResolucioneDto: CreateResolucionDto) {
    return this.resolucionesService.create(createResolucioneDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null,
  ) {
    if (page && limit) {
      console.log('1 - buscando resoluciones con paginacion', { page, limit });
      const data = await this.resolucionesService.findAll({ page, limit });
      const totalRecords = await this.resolucionesService.getTotalCount();
      console.log('2 - datos y totalRecords', { data, totalRecords });
      return { data, totalRecords };
    }
    console.log('1 - buscando todas las resoluciones sin paginacion');
    return await this.resolucionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resolucionesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResolucioneDto: UpdateResolucioneDto,
  ) {
    return this.resolucionesService.update(+id, updateResolucioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resolucionesService.remove(+id);
  }
}
