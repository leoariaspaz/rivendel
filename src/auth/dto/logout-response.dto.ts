import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
	constructor(ok: boolean) {
		this.ok = ok;
	}

  @ApiProperty({ example: true })
  ok!: boolean;
}