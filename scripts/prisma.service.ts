import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

export function client(): PrismaClient {
  if (process.env.DATABASE_CA_CERT) {
    const caPath = path.join('/tmp', 'ca.name');
    fs.writeFileSync(caPath, process.env.DATABASE_CA_CERT);
    process.env.NODE_EXTRA_CA_CERTS = caPath;
  }

  console.log('Connecting to: ' + process.env.DATABASE_URL);
  return new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
}

export async function test() {
  const td = await client().$queryRaw`select * from TipoDocumento`;
  console.log(td);
}
