import { ApiProperty } from "@nestjs/swagger/dist";

export class LoginDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  email!: string;

  @ApiProperty({ example: 'password123', format: 'password' })
  password!: string;
}