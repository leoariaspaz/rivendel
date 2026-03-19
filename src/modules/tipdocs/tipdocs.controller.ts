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
import { TipdocsService } from './tipdocs.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';

@Controller('tipdocs')
export class TipdocsController {
  constructor(private readonly tipdocsService: TipdocsService) {}

  @Post()
  async create(@Body() createTipdocDto: CreateTipdocDto) {
    return this.tipdocsService.create(createTipdocDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null,
  ) {
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
  update(@Param('id') id: string, @Body() updateTipdocDto: UpdateTipdocDto) {
    return this.tipdocsService.update(+id, updateTipdocDto);
  }

  @Delete(':id')
  remove(@Param('id', ValidateIntRelationPipe(TipdocsService)) id: number) {
    return this.tipdocsService.remove(id);
  }
}
