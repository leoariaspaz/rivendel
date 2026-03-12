import { BadRequestException, Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { SkipJwt } from 'src/auth/skip-jwt.decorator';

@Controller('users')
//@SkipJwt()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch()
  async update(@Req() req, @Body() dto: UpdateUserDTO) {
		if (!req.user) {
			throw new BadRequestException(["No existe el usuario."]);
		}
		
		const user = await this.usersService.findById(req.user.userId);
		if (!user) {
			throw new BadRequestException("Error al buscar el usuario.")
		}

		let password: string = user.password;
    if (dto.currentPassword) {
      if (dto.newPassword !== dto.newPasswordRepeated) {
        throw new BadRequestException(['Debe repetir la nueva contraseña.']);
      }

      const isValid = await this.authService.validateUserPassword(dto.currentPassword, user.password);
      if (isValid) {
        password = await this.authService.hashPasword(dto.newPassword);
      } else {
        throw new BadRequestException(['La contraseña actual es incorrecta.']);
      }
    }

    return this.usersService.update(req.user?.userId, dto.nombre, password);
  }
}
