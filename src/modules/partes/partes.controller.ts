import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { PartesService } from './partes.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';

@Controller('partes')
export class PartesController {
  constructor(private readonly partesService: PartesService) {}

  @Post()
  async create(@Body() createParteDto: CreateParteDto) {
    if (await this.partesService.isUnique({ nroDocumento: createParteDto.nroDocumento })) {
      throw new BadRequestException(['Ya existe una parte con este número de documento.']);
    }
    return this.partesService.create(createParteDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string | null = null,
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null
  ) {
    const totalRecords = await this.partesService.getTotalCount(query);
    const data = await this.partesService.findAll(query, page, limit);
    return { data, totalRecords };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateParteDto: UpdateParteDto) {
    if (await this.partesService.isUnique({ id, nroDocumento: updateParteDto.nroDocumento })) {
      throw new BadRequestException(['Ya existe una parte con este número de documento.']);
    }
    return this.partesService.update(+id, updateParteDto);
  }

  @Delete(':id')
  remove(@Param('id', ValidateIntRelationPipe(PartesService)) id: number) {
    return this.partesService.remove(id);
  }
}
