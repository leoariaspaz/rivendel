import { Module } from '@nestjs/common';
import { PatrocinantesModule } from 'src/patrocinantes/patrocinantes.module';
import { PatrocinantesService } from 'src/patrocinantes/patrocinantes.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PrismaModule } from 'src/shared/modules/prisma.module';
import { TipdocsModule } from 'src/tipdocs/tipdocs.module';
import { TipdocsService } from 'src/tipdocs/tipdocs.service';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';
import { PartesService } from 'src/partes/partes.service';
import { ValidateRelationConstraint } from './ValidateRelationConstraint';

@Module({
  imports: [PatrocinantesModule, PrismaModule, TipdocsModule],
  providers: [
    PatrocinantesService,
    TipdocsService,
    PrismaService,
    ResolucionesService,
    PartesService,
    ValidateRelationConstraint,
  ],
  exports: [ValidateRelationConstraint],
})
export class ValidatorsModule {}
