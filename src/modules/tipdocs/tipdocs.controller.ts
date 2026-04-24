import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { TipdocsService } from './tipdocs.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import { ApiTags } from '@nestjs/swagger/dist';

@ApiTags('Tipos de Documentos')
@Controller('tipdocs')
export class TipdocsController {
  constructor(private readonly tipdocsService: TipdocsService) {}

  @Post()
  async create(@Body() createTipdocDto: CreateTipdocDto) {
    if (await this.tipdocsService.isUnique({ sintetico: createTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.create(createTipdocDto);
  }

  @Get()
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    if (page === null || limit === null) {
      return this.tipdocsService.findAll();
    }
    const totalRecords = await this.tipdocsService.getTotalCount();
    const data = await this.tipdocsService.findAllPaginated(page, limit);
    return { data, totalRecords };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipdocsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateTipdocDto: UpdateTipdocDto) {
    if (await this.tipdocsService.isUnique({ id, sintetico: updateTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.update(+id, updateTipdocDto);
  }

  @Delete(':id')
  remove(@Param('id', ValidateIntRelationPipe(TipdocsService)) id: number) {
    return this.tipdocsService.remove(id);
  }
}
