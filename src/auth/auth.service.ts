import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, senha_digitada: string) {
    // 1. Busca o aluno pelo email
    const usuario = await this.usersService.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    // 2. Compara a senha digitada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha_digitada, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    // 3. Monta o "Payload" (os dados que vão dentro do código JWT)
    // Não coloque dados sensíveis aqui (como senha), pois o frontend consegue ler o payload.
    const payload = {
      sub: usuario._id,
      email: usuario.email,
      role: usuario.role,
      nome: usuario.nome,
    };

    // 4. Retorna o Token para o Frontend salvar no celular do aluno
    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: { nome: usuario.nome, role: usuario.role },
    };
  }
}
