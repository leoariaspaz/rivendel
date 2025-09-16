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
import { PartesService } from './partes.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';

@Controller('partes')
export class PartesController {
  constructor(private readonly partesService: PartesService) {}

  @Post()
  create(@Body() createParteDto: CreateParteDto) {
    return this.partesService.create(createParteDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null,
  ) {
    if (page === null || limit === null) {
      return await this.partesService.findAll();
    }
    const totalRecords = await this.partesService.getTotalCount();
    const data = await this.partesService.findAllPaginated(page, limit);
    return { data, totalRecords };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParteDto: UpdateParteDto) {
    return this.partesService.update(+id, updateParteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partesService.remove(+id);
  }
}
