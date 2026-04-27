import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TipdocsService } from './tipdocs.service';
import { CreateTipdocDto } from './dto/create-tipdoc.dto';
import { UpdateTipdocDto } from './dto/update-tipdoc.dto';
import { ValidateIntRelationPipe } from 'src/pipes/RelationshipValidationPipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger/dist';
import { TipoDocumentoDto } from './dto/tipo-documento.dto';
import { TipDocListDto } from './dto/tipdoc-list.dto';
import { ApiTipdocSave } from './decorators/tipdocs-swagger.decorator';

@Controller('tipdocs')
@ApiTags('Tipos de Documentos')
@ApiExtraModels(TipoDocumentoDto)
@ApiBearerAuth('access-token')
export class TipdocsController {
  constructor(private readonly tipdocsService: TipdocsService) {}

  @Post()
  @ApiTipdocSave('create')
  async create(@Body() createTipdocDto: CreateTipdocDto) {
    if (await this.tipdocsService.isUnique({ sintetico: createTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.create(createTipdocDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los tipos de documentos' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página para paginación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros por página para paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de documentos obtenida exitosamente.',
    type: TipDocListDto,
  })
  async findAll(@Query('page') page: number | null = null, @Query('limit') limit: number | null = null) {
    const result = new TipDocListDto();
    if (page === null || limit === null) {
      result.data = await this.tipdocsService.findAll();
      result.totalRecords = result.data.length;
    } else {
      result.totalRecords = await this.tipdocsService.getTotalCount();
      result.data = await this.tipdocsService.findAllPaginated(page, limit);
    }
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un tipo de documento por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tipo de documento' })
  @ApiResponse({ status: 200, description: 'Tipo de documento obtenido exitosamente.', type: TipoDocumentoDto })
  @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.tipdocsService.findOne(id);
  }

  @Patch(':id')
  @ApiTipdocSave('update')
  async update(@Param('id') id: number, @Body() updateTipdocDto: UpdateTipdocDto) {
    if (await this.tipdocsService.isUnique({ id, sintetico: updateTipdocDto.sintetico })) {
      throw new BadRequestException(['Ya existe un tipo de documento con este sintético.']);
    }
    return this.tipdocsService.update(id, updateTipdocDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un tipo de documento por su ID' })
  @ApiResponse({ status: 204, description: 'Tipo de documento eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado.' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar el tipo de documento porque tiene datos relacionados.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del tipo de documento a eliminar' })
  async remove(@Param('id', ValidateIntRelationPipe(TipdocsService)) id: number): Promise<void> {
    await this.tipdocsService.remove(id);
  }
}
