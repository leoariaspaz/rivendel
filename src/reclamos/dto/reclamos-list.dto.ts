import { ApiProperty } from "@nestjs/swagger";
import { FindReclamoDTO } from "./find-reclamo.dto";

export class ReclamosListDto {
	constructor(partes: FindReclamoDTO[], totalRecords: number) {
		this.data = partes;
		this.totalRecords = totalRecords;
	}

	@ApiProperty({ description: 'Lista obtenida de reclamos' })
	data!: FindReclamoDTO[];

	@ApiProperty({ description: 'Total de registros que coinciden con la búsqueda' })
	totalRecords!: number;
}