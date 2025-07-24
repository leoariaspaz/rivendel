import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';

@Controller('patrocinantes')
export class PatrocinantesController {
  constructor(private readonly patrocinantesService: PatrocinantesService) {}

  @Post()
  create(@Body() createPatrocinanteDto: CreatePatrocinanteDto) {
    return this.patrocinantesService.create(createPatrocinanteDto);
  }

  @Get()
  findAll() {
    return this.patrocinantesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patrocinantesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePatrocinanteDto: UpdatePatrocinanteDto,
  ) {
    return this.patrocinantesService.update(+id, updatePatrocinanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patrocinantesService.remove(+id);
  }
}
