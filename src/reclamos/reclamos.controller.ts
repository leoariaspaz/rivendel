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
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { RECLAMANTE } from 'src/shared/utils/constants';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiReclamoSave } from './decorators/reclamos-swagger.decorator';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { ReclamosListDto } from './dto/reclamos-list.dto';
import { FindOneReclamoDTO } from './dto/find-one-reclamo.dto';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import customParseFormat from 'dayjs/plugin/customParseFormat';

@Controller('reclamos')
@ApiTags('Reclamos')
@ApiBearerAuth('access-token')
export class ReclamosController {
  constructor(private readonly reclamosService: ReclamosService) {}

  @Post()
  @ApiReclamoSave('create')
  async create(@GetUser('userId') userId: number, @Body() createReclamoDto: CreateReclamoDto) {
    await this.validateUniqueness(undefined, createReclamoDto.numero, createReclamoDto.fechaHoraInicio);
    return this.reclamosService.create(userId, createReclamoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene una lista de reclamos con paginación y búsqueda' })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Término de búsqueda para filtrar por número o descripción',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página para paginación (comienza en 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de registros por página para paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de reclamos obtenida exitosamente. Se incluye el total de registros para paginación.',
    type: [ReclamosListDto],
  })
  async findAll(
    @GetUser('userId') userId: number,
    @Query('query') query: string | null = null,
    @Query('page') page: number | null = null,
    @Query('limit') limit: number | null = null
  ): Promise<ReclamosListDto> {
    return new ReclamosListDto(
      await this.reclamosService.findAll(userId, query, page, limit),
      await this.reclamosService.getTotalCount(userId, query)
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un reclamo por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del reclamo' })
  @ApiResponse({
    status: 200,
    description: 'Reclamo obtenido exitosamente.',
    example: {
      id: 1,
      numero: 123,
      fechaHoraInicio: '2024-01-01T17:00:00Z',
      horaFin: '2024-01-01T17:15:00Z',
      idResolucion: 1,
      proximaAudiencia: null,
      rubros: 'Rubro 1, Rubro 2',
      partes: [
        {
          idParte: 1,
          incomparendo: false,
          multado: false,
          nroWhatsappParte: null,
          nroWhatsappPatrocinante: null,
          postergo: false,
          rol: RECLAMANTE,
          cuil: '20121231238',
          domicilio: 'Calle Falsa 123',
          esApoderado: false,
          id: 1,
          localidad: 'Ciudad',
          nombre: 'Juan Pérez',
          nroDocumento: '12345678',
          patrocinante: {
            domicilio: 'Calle Patrocinante 456',
            localidad: 'Ciudad Patrocinante',
            nombre: 'Abogado Patrocinante',
            nroCasillero: 1234,
            nroMatricula: 5678,
          },
          tipoDocumento: {
            sintetico: 'DNI',
          },
        },
      ],
      cantidad: 1,
    },
  })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado.' })
  async findOne(@GetUser('userId') userId: number, @Param('id') id: number): Promise<FindOneReclamoDTO> {
    const reclamo = await this.reclamosService.findOne(userId, id);
    const cantidad = await this.reclamosService.count(userId, reclamo?.numero ?? 0, reclamo?.fechaHoraInicio);
    return reclamo.toFindOneReclamoDTO(cantidad);
  }

  @Patch(':id')
  @ApiReclamoSave('update')
  async update(@GetUser('userId') userId: number, @Param('id') id: number, @Body() updateReclamoDto: UpdateReclamoDto) {
    await this.validateUniqueness(id, updateReclamoDto.numero, updateReclamoDto.fechaHoraInicio);
    return this.reclamosService.update(userId, +id, updateReclamoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un reclamo por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del reclamo a eliminar' })
  @ApiResponse({ status: 204, description: 'Reclamo eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado.' })
  async remove(@GetUser('userId') userId: number, @Param('id') id: string) {
    await this.reclamosService.remove(userId, +id);
  }

  private async validateUniqueness(id: number | undefined, numero: number | undefined, fecha: Date | undefined) {
    const filter = { id, numero, fecha };
    if (!(await this.reclamosService.isUnique(filter))) {
      dayjs.extend(customParseFormat);
      const fechaFormateada = dayjs(fecha).locale('es').format('DD [de] MMMM [de] YYYY [a las] HH:mm [hs]');
      throw new BadRequestException([`Ya existe un reclamo Nº ${numero} para la fecha ${fechaFormateada}.`]);
    }
  }
}
