import * as path from 'path';
import * as fs from 'fs';
import { client } from './prisma.service';

//npx ts-node scripts/export-db.ts
async function main() {
  const prisma = client();

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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
