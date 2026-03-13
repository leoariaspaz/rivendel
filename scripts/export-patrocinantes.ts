import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🚀 Iniciando exportación de Patrocinantes...');

    const patrocinantes = await prisma.patrocinante.findMany({
      orderBy: { id: 'asc' },
    });

    const filePath = path.join(__dirname, 'patrocinantes.json');
    fs.writeFileSync(filePath, JSON.stringify(patrocinantes, null, 2));

    console.log(`✅ Exportación completada con éxito.`);
    console.log(`📂 Archivo generado en: ${filePath}`);
    console.log(`📊 Total registros: ${patrocinantes.length}`);
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
