// pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts 123
// pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts 123 ./scripts/reclamo-123.json

import * as fs from 'node:fs';
import * as path from 'node:path';
import dotenv from 'dotenv';
import { client } from './prisma.service';

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

function ensureInteger(value: unknown, label: string): number {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new Error(`El valor de ${label} debe ser un entero.`);
  }
  return num;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || !args[0]) {
    console.error('Uso: pnpm exec dotenv -e .env.production -- npx tsx scripts/export-reclamo.ts <idReclamo> [outputPath]');
    process.exit(1);
  }

  const reclamoId = ensureInteger(args[0], 'idReclamo');
  const outputPath = args[1]
    ? path.resolve(process.cwd(), args[1])
    : path.resolve(__dirname, `reclamo-${reclamoId}.json`);

  const prisma = client();

  try {
    const reclamo = await prisma.reclamos.findUnique({
      where: { id: reclamoId },
      include: {
        usuario: true,
        partes: {
          orderBy: { id: 'asc' },
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
    });

    if (!reclamo) {
      throw new Error(`No existe un reclamo con id ${reclamoId}.`);
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
