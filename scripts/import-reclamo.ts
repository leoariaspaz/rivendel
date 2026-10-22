// pnpm exec dotenv -e .env.production -- npx tsx scripts/import-reclamo.ts ./scripts/reclamo-123.json

import * as fs from 'node:fs';
import * as path from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
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

function requireFileArg(): string {
  const [fileArg] = process.argv.slice(2);
  if (!fileArg) {
    console.error(
      'Uso: pnpm exec dotenv -e .env.production -- npx tsx scripts/import-reclamo.ts <archivoExportado.json>'
    );
    process.exit(1);
  }
  return path.resolve(process.cwd(), fileArg);
}

async function promptReclamoUser(users: Array<{ id: number; nombre: string | null; email: string }>): Promise<number> {
  if (users.length === 0) {
    throw new Error('No hay usuarios en la aplicación para relacionar con el reclamo.');
  }

  console.log('Usuarios disponibles para relacionar con el reclamo:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.nombre ?? '(sin nombre)'} <${user.email}>`);
  });

  const input = createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const answer = await input.question('Elegí el número del usuario: ');
      const selection = Number(answer);
      if (Number.isInteger(selection) && selection >= 1 && selection <= users.length) {
        return users[selection - 1].id;
      }
      console.log(`Ingresá un número entre 1 y ${users.length}.`);
    }
  } finally {
    input.close();
  }
}

async function main() {
  const filePath = requireFileArg();
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe el archivo de exportación: ${filePath}`);
  }

  const rawFile = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawFile) as ExportedReclamoFile;

  const prisma = client();

  try {
    const { reclamo, usuarios, patrocinantes, tipoDocumentos, partes, partesReclamos } = data;

    if (
      !reclamo ||
      !Array.isArray(usuarios) ||
      !Array.isArray(patrocinantes) ||
      !Array.isArray(tipoDocumentos) ||
      !Array.isArray(partes) ||
      !Array.isArray(partesReclamos)
    ) {
      throw new Error('El archivo exportado no tiene el formato esperado.');
    }

    const destinationUsers = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    const reclamoUserId = await promptReclamoUser(destinationUsers);

    const userMap = new Map<number, number>();
    const patrocinanteMap = new Map<number, number>();
    const tipoDocumentoMap = new Map<number, number>();
    const parteMap = new Map<number, number>();
    const reclamoMap = new Map<number, number>();

    const users = await prisma.user.findMany({ orderBy: { id: 'desc' } });
    const maxUserId = users[0]?.id ?? 0;
    let nextUserId = maxUserId + 1;

    for (const user of usuarios) {
      const userId = Number(user.id);
      const email = String(user.email);

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        userMap.set(userId, existing.id);
        continue;
      }

      const created = await prisma.user.create({
        data: {
          ...(user as Record<string, unknown>),
          id: nextUserId,
        },
      });

      userMap.set(userId, created.id);
      nextUserId += 1;
    }

    const tipoDocs = await prisma.tipoDocumento.findMany({ orderBy: { id: 'desc' } });
    const maxTipoDocumentoId = tipoDocs[0]?.id ?? 0;
    let nextTipoDocumentoId = maxTipoDocumentoId + 1;

    for (const tipoDocumento of tipoDocumentos) {
      const oldId = Number(tipoDocumento.id);
      const sintetico = String(tipoDocumento.sintetico);

      const existing = await prisma.tipoDocumento.findUnique({ where: { sintetico } });
      if (existing) {
        tipoDocumentoMap.set(oldId, existing.id);
        continue;
      }

      const created = await prisma.tipoDocumento.create({
        data: {
          ...(tipoDocumento as Record<string, unknown>),
          id: nextTipoDocumentoId,
        },
      });

      tipoDocumentoMap.set(oldId, created.id);
      nextTipoDocumentoId += 1;
    }

    const patrocinanteRows = await prisma.patrocinante.findMany({ orderBy: { id: 'desc' } });
    const maxPatrocinanteId = patrocinanteRows[0]?.id ?? 0;
    let nextPatrocinanteId = maxPatrocinanteId + 1;

    for (const patrocinante of patrocinantes) {
      const oldId = Number(patrocinante.id);
      const nroMatricula = Number(patrocinante.nroMatricula);

      const existing = await prisma.patrocinante.findUnique({ where: { nroMatricula } });
      if (existing) {
        patrocinanteMap.set(oldId, existing.id);
        continue;
      }

      const created = await prisma.patrocinante.create({
        data: {
          ...(patrocinante as Record<string, unknown>),
          id: nextPatrocinanteId,
        },
      });

      patrocinanteMap.set(oldId, created.id);
      nextPatrocinanteId += 1;
    }

    const partesDb = await prisma.parte.findMany({ orderBy: { id: 'desc' } });
    const maxParteId = partesDb[0]?.id ?? 0;
    let nextParteId = maxParteId + 1;

    for (const parte of partes) {
      const oldId = Number(parte.id);
      const mappedPatrocinante =
        parte.idPatrocinante == null ? null : (patrocinanteMap.get(Number(parte.idPatrocinante)) ?? null);
      const mappedTipoDocumento = tipoDocumentoMap.get(Number(parte.idTipoDocumento));
      const mappedUser = parte.idUsuario == null ? null : (userMap.get(Number(parte.idUsuario)) ?? null);

      const created = await prisma.parte.create({
        data: {
          ...(parte as Record<string, unknown>),
          id: nextParteId,
          idPatrocinante: mappedPatrocinante,
          idTipoDocumento: mappedTipoDocumento,
          idUsuario: mappedUser,
        },
      });

      parteMap.set(oldId, created.id);
      nextParteId += 1;
    }

    const reclamosDb = await prisma.reclamos.findMany({ orderBy: { id: 'desc' } });
    const maxReclamoId = reclamosDb[0]?.id ?? 0;
    let nextReclamoId = maxReclamoId + 1;

    const oldReclamoId = Number(reclamo.id);
    const existingReclamo = await prisma.reclamos.findFirst({
      where: {
        numero: Number(reclamo.numero),
        fechaHoraInicio: new Date(String(reclamo.fechaHoraInicio)),
      },
    });

    if (existingReclamo) {
      throw new Error(
        `Ya existe un reclamo con número ${reclamo.numero} y fecha ${reclamo.fechaHoraInicio} en la base destino.`
      );
    }

    const createdReclamo = await prisma.reclamos.create({
      data: {
        ...(reclamo as Record<string, unknown>),
        id: nextReclamoId,
        idUsuario: reclamoUserId,
      },
    });

    reclamoMap.set(oldReclamoId, createdReclamo.id);
    nextReclamoId += 1;

    for (const relation of partesReclamos) {
      const oldIdParte = Number(relation.idParte);
      const oldIdReclamo = Number(relation.idReclamo);
      const newIdParte = parteMap.get(oldIdParte);
      const newIdReclamo = reclamoMap.get(oldIdReclamo) ?? createdReclamo.id;

      if (!newIdParte) {
        throw new Error(`No se pudo mapear la parte ${oldIdParte} para la relación de reclamo.`);
      }

      const { id: _unusedId, ...relationData } = relation as Record<string, unknown>;
      await prisma.partesReclamos.create({
        data: {
          ...relationData,
          idParte: newIdParte,
          idReclamo: newIdReclamo,
        },
      });
    }

    console.log(`✅ Importación completada.`);
    console.log(`📌 Reclamo importado con id nuevo: ${reclamoMap.get(oldReclamoId)}`);
    console.log(`📁 Archivo origen: ${filePath}`);
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
