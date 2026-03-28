import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { PatrocinantesService } from './patrocinantes.service';
import { CreatePatrocinanteDto } from './dto/create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './dto/update-patrocinante.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';

@Controller('patrocinantes')
export class PatrocinantesController {
  constructor(private readonly patrocinantesService: PatrocinantesService) {}

  @Post()
  async create(@Body() createPatrocinanteDto: CreatePatrocinanteDto) {
    if (await this.patrocinantesService.isUnique({ nroMatricula: createPatrocinanteDto.nroMatricula })) {
      throw new BadRequestException(['Ya existe un patrocinante con este número de matrícula.']);
    }
    return this.patrocinantesService.create(createPatrocinanteDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string | null = null,
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null
  ) {
    const totalRecords = await this.patrocinantesService.getTotalCount(query);
    const data = await this.patrocinantesService.findAll(query, page, limit);
    return { data, totalRecords };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patrocinantesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatePatrocinanteDto: UpdatePatrocinanteDto) {
    if (await this.patrocinantesService.isUnique({ id,  nroMatricula: updatePatrocinanteDto.nroMatricula })) {
      throw new BadRequestException(['Ya existe un patrocinante con este número de matrícula.']);
    }
    return this.patrocinantesService.update(+id, updatePatrocinanteDto);
  }

  @Delete(':id')
  remove(@Param('id', ValidateIntRelationPipe(PatrocinantesService)) id: number) {
    return this.patrocinantesService.remove(id);
  }
}
