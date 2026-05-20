/* eslint-disable prettier/prettier */
import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from './auth.guard';
import { RegistroDto } from './dto/registro.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: Record<string, any>) {
    return this.authService.login(body.email, body.senha);
  }

  @UseGuards(AuthGuard) 
  @Post('registro')
  registrar(@Request() req, @Body() body: RegistroDto) {
    // Verifica se quem está tentando criar a conta é a escola
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas a administração pode cadastrar novos alunos.');
    }
    // Forçamos a role para 'ALUNO' por segurança, para o admin não criar outro admin sem querer
    return this.usersService.criarUsuario(body);
  }
}
