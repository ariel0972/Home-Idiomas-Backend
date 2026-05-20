/* eslint-disable prettier/prettier */
import { Controller, Get, Put, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard'; // Importando nosso guardião

// Protege TODAS as rotas deste arquivo exigindo o Token JWT
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listarUsuarios(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem ver a lista de usuarios.');
    }
    return this.usersService.listarTodosUsuarios();
  }

  // Rota para pegar a lista de todos os alunos
  @Get('alunos')
  async listarAlunos(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem ver a lista de alunos.');
    }
    return this.usersService.listarTodosAlunos();
  }

  // Rota para atualizar professor e turma (e outros dados se precisar)
  @Put(':id')
  async atualizar(@Request() req, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem editar alunos.');
    }
    // Evita que alguém mude a role de ALUNO para ADMIN por acidente na edição
    delete body.role;
    return this.usersService.atualizarAluno(id, body);
  }

  // Rota para deletar um aluno definitivamente
  @Delete(':id')
  async deletar(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem excluir alunos.');
    }
    await this.usersService.deletarAluno(id);
    return { success: true, message: 'Aluno removido com sucesso do sistema.' };
  }
}
