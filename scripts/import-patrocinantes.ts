import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import patrocinantesRaw from './patrocinantes.json';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();
console.log(process.env.DATABASE_URL);

if (process.env.DATABASE_CA_CERT) {
  const caPath = path.join('/tmp', 'ca.name');
  fs.writeFileSync(caPath, process.env.DATABASE_CA_CERT);
  process.env.NODE_EXTRA_CA_CERTS = caPath;
}

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

// async function test() {
//   const td = await prisma.$queryRaw`select * from TipoDocumento`;
//   console.log(td);
// }

async function bulkInsert() {
  interface PatrocinanteJson {
    id: number;
    nombre: string;
    nroMatricula: number;
    domicilio: string | null;
    localidad: string | null;
    nroCasillero: number | null;
  }

  const patrocinantes = patrocinantesRaw as PatrocinanteJson[];

  const data = patrocinantes.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    nroMatricula: p.nroMatricula,
    domicilio: p.domicilio,
    localidad: p.localidad,
    nroCasillero: p.nroCasillero,
  }));

  const result = await prisma.patrocinante.createMany({
    data,
    skipDuplicates: true, // evita error si hay nroMatricula duplicados
  });

  console.log(`Insertados: ${result.count}`);
}

bulkInsert()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
