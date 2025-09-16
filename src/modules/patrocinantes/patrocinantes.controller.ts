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
  async findAll(
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null,
  ) {
    if (page === null || limit === null) {
      return this.patrocinantesService.findAll();
    }
    const totalRecords = await this.patrocinantesService.getTotalCount();
    const data = await this.patrocinantesService.findAllPaginated(page, limit);
    return { data, totalRecords };
  }

  @Get()
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const totalRecords = await this.patrocinantesService.getTotalCount();
    const data = await this.patrocinantesService.findAllPaginated(page, limit);
    return { data, totalRecords };
  }

  @Get('search')
  search(@Query('term') term: string) {
    return this.patrocinantesService.search(term);
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
