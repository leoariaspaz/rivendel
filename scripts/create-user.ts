//pnpm exec dotenv -e .env.production -- npx tsx scripts/create-user.ts
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { client } from './prisma.service';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];

  if (!email || !password || !name) {
    console.error('Uso: npx tsx scripts/create-user.ts <email> <password> <name>');
    console.error(
      `Por ejemplo: pnpm exec dotenv -e .env.production -- npx tsx scripts/create-user.ts user@example.com mypassword "John Doe"`
    );
    process.exit(1);
  }

  dotenv.config();
  const prisma = client();

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

void main();
