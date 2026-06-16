//pnpm exec dotenv -e .env.production -- npx tsx scripts/import-patrocinantes.ts
import dotenv from 'dotenv';
import patrocinantesRaw from './patrocinantes.json';
import { client } from './prisma.service';
import { PrismaClient } from '@prisma/client';

interface PatrocinanteJson {
  id: number;
  nombre: string;
  nroMatricula: number;
  domicilio: string | null;
  localidad: string | null;
  nroCasillero: number | null;
}

async function bulkInsert(dbService: PrismaClient) {
  const patrocinantes = patrocinantesRaw as PatrocinanteJson[];

  const data = patrocinantes.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    nroMatricula: p.nroMatricula,
    domicilio: p.domicilio,
    localidad: p.localidad,
    nroCasillero: p.nroCasillero,
  }));

  const result = await dbService.patrocinante.createMany({
    data,
    skipDuplicates: true, // evita error si hay nroMatricula duplicados
  });

  console.log(`Insertados: ${result.count}`);
}

dotenv.config();
const srv = client();
bulkInsert(srv)
  .catch(console.error)
  .finally(() => srv.$disconnect());
