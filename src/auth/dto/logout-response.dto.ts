import { ApiProperty } from "@nestjs/swagger/dist";

export class LogoutResponseDto {
	constructor(ok: boolean) {
		this.ok = ok;
	}

  @ApiProperty({ example: true })
  ok!: boolean;
}