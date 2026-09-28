import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);

  const email = process.env.SEED_ADMIN_EMAIL;
  const senha = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !senha) {
    throw new Error(
      'SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD precisam estar definidos.',
    );
  }

  const usuarioExistente = await usersService.buscarPorEmail(email);

  if (usuarioExistente) {
    console.log('Administrador já existe.');
    await app.close();
    return;
  }

  await usersService.criarUsuario({
    nome: 'Administrador',
    nome_completo: 'Administrador Home Idiomas',
    email,
    senha,
    role: 'ADMIN',
    status: 'ATIVO',
    statusTurma: 'ATIVO',
  });

  console.log('Administrador criado com sucesso.');

  await app.close();
}

seed();
