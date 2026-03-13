import { BadRequestException, Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get('/getCurrent')
  async getCurrentUser(@Req() req) {
    const result = await this.usersService.findById(req.user?.userId);
    return result?.nombre;
  }

  @Patch()
  async update(@Req() req, @Body() dto: UpdateUserDTO) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new BadRequestException('Error al buscar el usuario.');
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

    return this.usersService.update(req.user?.userId, dto.nombre, password);
  }
}
