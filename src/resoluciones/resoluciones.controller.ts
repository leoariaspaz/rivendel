import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ResolucionesService } from './resoluciones.service';
import { CreateResolucionDto } from './dto/create-resolucion.dto';
import { UpdateResolucionDto } from './dto/update-resolucion.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';

@Controller('resoluciones')
export class ResolucionesController {
  constructor(private readonly resolucionesService: ResolucionesService) {}

  @Post()
  async create(@Body() createResolucionDto: CreateResolucionDto) {
    if (await this.resolucionesService.isUnique({ descripcion: createResolucionDto.descripcion })) {
      throw new BadRequestException(['Ya existe una resolución con esta descripción.']);
    }
    return this.resolucionesService.create(createResolucionDto);
  }

  @Get()
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    if (page && limit) {
      const data = await this.resolucionesService.findAll({ page, limit });
      const totalRecords = await this.resolucionesService.getTotalCount();
      return { data, totalRecords };
    }
    return await this.resolucionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resolucionesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateResolucioneDto: UpdateResolucionDto) {
    if (await this.resolucionesService.isUnique({ id, descripcion: updateResolucioneDto.descripcion })) {
      throw new BadRequestException(['Ya existe una resolución con esta descripción.']);
    }
    return this.resolucionesService.update(+id, updateResolucioneDto);
  }

  @Delete(':id')
  remove(@Param('id', ValidateIntRelationPipe(ResolucionesService)) id: number) {
    return this.resolucionesService.remove(id);
  }
}
