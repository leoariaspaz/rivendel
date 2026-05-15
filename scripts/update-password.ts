//crear un script para actualizar la contraseña de un usuario existente en la base de datos utilizando Prisma y bcryptjs. El usuario será pasado por parámetros desde consola.
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

async function main() {
	const email = process.argv[2];
	const newPassword = process.argv[3];
	
	if (!email || !newPassword) {
		console.error('Uso: node scripts/update-password.ts <email> <newPassword>');
		console.error(`Por ejemplo: npx ts-node scripts/update-password.ts`);
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

main();