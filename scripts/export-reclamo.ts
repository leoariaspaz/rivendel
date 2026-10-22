// pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts 123
// pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts 123 ./scripts/reclamo-123.json

import * as fs from 'node:fs';
import * as path from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import dotenv from 'dotenv';
import { client } from './prisma.service';
import { parseExportArguments, ReclamoSelectionOption, selectReclamoCandidate } from './reclamo-selection';

dotenv.config();

interface ExportedReclamoFile {
  version: number;
  exportedAt: string;
  reclamo: Record<string, unknown>;
  usuarios: Array<Record<string, unknown>>;
  patrocinantes: Array<Record<string, unknown>>;
  tipoDocumentos: Array<Record<string, unknown>>;
  partes: Array<Record<string, unknown>>;
  partesReclamos: Array<Record<string, unknown>>;
}

async function promptReclamoSelection(options: ReclamoSelectionOption[]): Promise<number> {
  console.log('Hay varios reclamos con ese número:');
  options.forEach((option, index) => console.log(`${index + 1}. ${option.label}`));

  const input = createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const answer = await input.question(`Elegí un reclamo (1-${options.length}): `);
      const selection = Number(answer);
      if (Number.isInteger(selection) && selection >= 1 && selection <= options.length) {
        return selection - 1;
      }
      console.log(`Ingresá un número entre 1 y ${options.length}.`);
    }
  } finally {
    input.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      'Uso: pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts [--id <id> | --numero <numero>] [outputPath]'
    );
    process.exit(1);
  }

  let parsedArgs;
  try {
    parsedArgs = parseExportArguments(args);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  const outputPath = parsedArgs.outputPath
    ? path.resolve(process.cwd(), parsedArgs.outputPath)
    : path.resolve(__dirname, `reclamo-${parsedArgs.valor}.json`);

  const prisma = client();

  try {
    const query = {
      include: {
        usuario: true,
        partes: {
          orderBy: { id: 'asc' as const },
          include: {
            parte: {
              include: {
                tipoDocumento: true,
                patrocinante: true,
                usuario: true,
              },
            },
          },
        },
      },
    };

    const reclamo =
      parsedArgs.tipo === 'id'
        ? await prisma.reclamos.findUnique({ where: { id: parsedArgs.valor }, ...query })
        : await selectReclamoCandidate(
            await prisma.reclamos.findMany({ where: { numero: parsedArgs.valor }, orderBy: { id: 'asc' }, ...query }),
            promptReclamoSelection
          ).then(({ id }) => prisma.reclamos.findUnique({ where: { id }, ...query }));

    if (!reclamo) {
      throw new Error(`No existe un reclamo con ${parsedArgs.tipo} ${parsedArgs.valor}.`);
    }

    const usuarios = new Map<number, Record<string, unknown>>();
    const patrocinantes = new Map<number, Record<string, unknown>>();
    const tipoDocumentos = new Map<number, Record<string, unknown>>();
    const partes: Array<Record<string, unknown>> = [];

    if (reclamo.usuario) {
      usuarios.set(reclamo.usuario.id, { ...reclamo.usuario });
    }

    for (const item of reclamo.partes) {
      const parte = item.parte;
      if (parte.usuario) {
        usuarios.set(parte.usuario.id, { ...parte.usuario });
      }
      if (parte.patrocinante) {
        patrocinantes.set(parte.patrocinante.id, { ...parte.patrocinante });
      }
      if (parte.tipoDocumento) {
        tipoDocumentos.set(parte.tipoDocumento.id, { ...parte.tipoDocumento });
      }

      partes.push({
        id: parte.id,
        nombre: parte.nombre,
        idTipoDocumento: parte.idTipoDocumento,
        nroDocumento: parte.nroDocumento,
        cuil: parte.cuil,
        idPatrocinante: parte.idPatrocinante,
        localidad: parte.localidad,
        domicilio: parte.domicilio,
        esApoderado: parte.esApoderado,
        idUsuario: parte.idUsuario,
      });
    }

    const payload: ExportedReclamoFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      reclamo: {
        id: reclamo.id,
        rubros: reclamo.rubros,
        idResolucion: reclamo.idResolucion,
        fechaHoraInicio: reclamo.fechaHoraInicio,
        horaFin: reclamo.horaFin,
        numero: reclamo.numero,
        proximaAudiencia: reclamo.proximaAudiencia,
        idUsuario: reclamo.idUsuario,
        clausulas: reclamo.clausulas,
        googleEventId: reclamo.googleEventId,
      },
      usuarios: Array.from(usuarios.values()),
      patrocinantes: Array.from(patrocinantes.values()),
      tipoDocumentos: Array.from(tipoDocumentos.values()),
      partes,
      partesReclamos: reclamo.partes.map((item) => ({
        id: item.id,
        idParte: item.idParte,
        idReclamo: item.idReclamo,
        rol: item.rol,
        nroWhatsappParte: item.nroWhatsappParte,
        nroWhatsappPatrocinante: item.nroWhatsappPatrocinante,
        postergo: item.postergo,
        incomparendoParte: item.incomparendoParte,
        incomparendoPatrocinante: item.incomparendoPatrocinante,
        multado: item.multado,
      })),
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

    console.log(`✅ Exportación realizada con éxito.`);
    console.log(`📄 Archivo: ${outputPath}`);
    console.log(`👤 Usuarios exportados: ${payload.usuarios.length}`);
    console.log(`🏢 Patrocinantes exportados: ${payload.patrocinantes.length}`);
    console.log(`📄 Documentos exportados: ${payload.tipoDocumentos.length}`);
    console.log(`🧩 Partes exportadas: ${payload.partes.length}`);
    console.log(`🔗 Relación partes-reclamos: ${payload.partesReclamos.length}`);
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
