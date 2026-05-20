import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TurmasService } from './turmas.service';
import { CriarTurmaDto } from './dto/turma.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard) // Protege todas as rotas exigindo o Token JWT
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  // Rota para criar turmas (Restrita para ADMIN)
  @Post()
  async criar(@Request() req, @Body() body: CriarTurmaDto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem criar novas turmas.');
    }
    return this.turmasService.criarTurma(body);
  }

  // Rota para listar turmas (Liberada para ADMIN e PROFESSOR gerenciarem)
  @Get()
  async listar(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROFESSOR') {
      throw new ForbiddenException('Você não tem permissão para visualizar as turmas.');
    }
    return this.turmasService.listarTodas();
  }
}
