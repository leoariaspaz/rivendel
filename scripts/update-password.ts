import * as bcrypt from 'bcryptjs';
import { client } from './prisma.service';

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Uso: npx tsc scripts/update-password.ts <email> <newPassword>');
    console.error(
      `Por ejemplo: pnpm exec dotenv -e .env.production -- npx tsx scripts/update-password.ts user@test.com abcdefg`
    );
    process.exit(1);
  }

  const prisma = client();

  try {
    console.log('🚀 Actualizando contraseña...');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Contraseña actualizada con éxito para el usuario:');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Nombre: ${updatedUser.nombre}`);
    console.log(`🆔 ID: ${updatedUser.id}`);
  } catch (error) {
    console.error('❌ Error al actualizar la contraseña:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
