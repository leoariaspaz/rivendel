
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];

  if (!email || !password || !name) {
    console.error('Uso: node scripts/create-user.ts <email> <password> <name>');
		console.error(`Por ejemplo: npx ts-node scripts/create-user.ts user@example.com mypassword "John Doe"`);
    process.exit(1);
  }

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
    console.log('🚀 Creando usuario...');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre: name,
      },
    });

    console.log('✅ Usuario creado con éxito:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nombre: ${user.nombre}`);
    console.log(`🆔 ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();