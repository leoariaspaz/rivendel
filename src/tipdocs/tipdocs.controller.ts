import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipdocsService } from './tipdocs.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';

@Controller('tipdocs')
export class TipdocsController {
  constructor(private readonly tipdocsService: TipdocsService) {}

  @Post()
  async create(@Body() createTipdocDto: CreateTipdocDto) {
    return this.tipdocsService.create(createTipdocDto);
  }

  @Get()
  findAll() {
    return this.tipdocsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipdocsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipdocDto: UpdateTipdocDto) {
    return this.tipdocsService.update(+id, updateTipdocDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipdocsService.remove(+id);
  }
}
