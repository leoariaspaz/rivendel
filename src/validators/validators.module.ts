import { Module } from "@nestjs/common";
import { PatrocinantesModule } from "src/modules/patrocinantes/patrocinantes.module";
import { PatrocinantesService } from "src/modules/patrocinantes/patrocinantes.service";
import { PrismaService } from "src/shared/services/prisma.service";
import { MustExistPatrocinanteConstraint } from "./MustExistPatrocinante";
import { PrismaModule } from "src/shared/modules/prisma.module";
import { TipdocsModule } from "src/modules/tipdocs/tipdocs.module";
import { TipdocsService } from "src/modules/tipdocs/tipdocs.service";
import { MustExistTipoDocumentoConstraint } from "./MustExistTipoDocumento";
import { MustNotExistsNroMatriculaConstraint } from "./MustNotExistsNroMatricula";

@Module({
	imports: [PatrocinantesModule, PrismaModule, TipdocsModule],
	providers: [PatrocinantesService, TipdocsService, PrismaService, MustExistPatrocinanteConstraint, MustExistTipoDocumentoConstraint,
		MustNotExistsNroMatriculaConstraint],
})
export class ValidatorsModule {}
