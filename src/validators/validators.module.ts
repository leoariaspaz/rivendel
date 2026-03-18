import { Module } from '@nestjs/common';
import { PatrocinantesModule } from 'src/modules/patrocinantes/patrocinantes.module';
import { PatrocinantesService } from 'src/modules/patrocinantes/patrocinantes.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { MustExistPatrocinanteConstraint } from './MustExistPatrocinante';
import { PrismaModule } from 'src/shared/modules/prisma.module';
import { TipdocsModule } from 'src/modules/tipdocs/tipdocs.module';
import { TipdocsService } from 'src/modules/tipdocs/tipdocs.service';
import { MustExistTipoDocumentoConstraint } from './MustExistTipoDocumento';
import { MustNotExistsNroMatriculaConstraint } from './MustNotExistsNroMatricula';
import { ResolucionesModule } from 'src/resoluciones/resoluciones.module';
import { MustExistResolucionConstraint } from './MustExistResolucion';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { PartesService } from 'src/modules/partes/partes.service';
import { MustExistParteConstraint } from './MustExistParte';

@Module({
  imports: [PatrocinantesModule, PrismaModule, TipdocsModule, ResolucionesModule],
  providers: [
    PatrocinantesService,
    TipdocsService,
    PrismaService,
    ResolucionesService,
		PartesService,
    MustExistPatrocinanteConstraint,
    MustExistTipoDocumentoConstraint,
    MustNotExistsNroMatriculaConstraint,
    MustExistResolucionConstraint,
		MustExistParteConstraint,
  ],
})
export class ValidatorsModule {}
