import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PartesReclamosService } from './partes-reclamos.service';
import { CreatePartesReclamoDto } from './dto/create-partes-reclamo.dto';
import { UpdatePartesReclamoDto } from './dto/update-partes-reclamo.dto';

@Controller('partes-reclamos')
export class PartesReclamosController {
  constructor(private readonly partesReclamosService: PartesReclamosService) {}

  @Post()
  create(@Body() createPartesReclamoDto: CreatePartesReclamoDto) {
    return this.partesReclamosService.create(createPartesReclamoDto);
  }

  @Get()
  findAll() {
    return this.partesReclamosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partesReclamosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePartesReclamoDto: UpdatePartesReclamoDto,
  ) {
    return this.partesReclamosService.update(+id, updatePartesReclamoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partesReclamosService.remove(+id);
  }
}
