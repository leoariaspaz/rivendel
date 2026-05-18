import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
	constructor(accessToken: string, userName: string) {
		this.accessToken = accessToken;
		this.userName = userName;
	}

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  userName!: string;
}