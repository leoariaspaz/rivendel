import { ApiProperty } from "@nestjs/swagger/dist";

export class RefreshResponseDto {
	constructor(accessToken: string, userName: string | null) {
		this.accessToken = accessToken;
		this.userName = userName;
	}

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  userName!: string | null;
}