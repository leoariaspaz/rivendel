import { BadRequestException, Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from './decorators/get-user.decorator';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get('/getCurrent')
  @ApiOperation({
    summary: 'Obtener información del usuario actual',
    description: 'Retorna un objeto con los datos básicos del usuario logueado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario obtenidos con éxito.',
    type: CurrentUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async getCurrentUser(@GetUser('userId') userId: number) {
    const result = await this.usersService.findById(userId);
    return new CurrentUserResponseDto(result?.nombre);
  }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar información del usuario actual',
    description: 'Permite actualizar el nombre y/o contraseña del usuario logueado.',
  })
  @ApiBody({
    type: UpdateUserDTO,
    examples: {
      valid: {
        summary: 'Ejemplo válido',
        value: {
          nombre: 'Nuevo Nombre',
          currentPassword: 'contraseñaActual',
          newPassword: 'nuevaContraseña',
        },
      },
      missingCurrentPassword: {
        summary: 'Error: Falta contraseña actual para cambiar la contraseña',
        value: {
          nombre: 'Nuevo Nombre',
          newPassword: 'nuevaContraseña',
        },
      },
      incorrectCurrentPassword: {
        summary: 'Error: Contraseña actual incorrecta',
        value: {
          nombre: 'Nuevo Nombre',
          currentPassword: 'contraseñaIncorrecta',
          newPassword: 'nuevaContraseña',
        },
      },
      validNameChangeOnly: {
        summary: 'Ejemplo válido para cambio de nombre sin cambiar contraseña',
        value: {
          nombre: 'Nuevo Nombre Sin Cambiar Contraseña',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Error al buscar el usuario o contraseña actual incorrecta.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async update(@GetUser('userId') userId: number, @Body() dto: UpdateUserDTO) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException(['Error al buscar el usuario.']);
    }

    let password: string = user.password;
    if (dto.currentPassword) {
      const isValid = await this.authService.validateUserPassword(dto.currentPassword, user.password);
      if (isValid) {
        password = await this.authService.hashPasword(dto.newPassword);
      } else {
        throw new BadRequestException(['La contraseña actual es incorrecta.']);
      }
    }

    return this.usersService.update(userId, dto.nombre, password);
  }
}
