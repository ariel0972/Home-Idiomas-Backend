import { Controller, Post, Get, Put, Body, UseGuards, Request, ForbiddenException, Delete, Param, Query } from '@nestjs/common';
import { TurmasService } from './turmas.service';
import { CriarTurmaDto } from './dto/turma.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
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

  // Rota para criar um novo diario
  @Post(':id/diario/iniciar')
  async criarDiario(
    @Param('id') turmaId: string,
    @Request() req,
    @Body('data') dataParam?: string,
  ) {
    return this.turmasService.iniciarClassLog(turmaId, req.user.sub, dataParam);
  }

  @Get('minha')
  async buscarMinhaTurma(@Request() req) {
    return this.turmasService.buscarTurmaDoAluno(req.user.sub);
  }

  // Rota para buscar diario da data de hoje
  @Get(':id/diario')
  async verificarDiario(
    @Param('id') turmaId: string,
    @Query('data') dataParam?: string,
  ) {
    const result = await this.turmasService.buscarClassLog(turmaId, dataParam);
    if (!result) {
      return {
        exists: false,
        message: 'Nenhum diário foi encontrado para essa data.',
      };
    }

    return { exists: true, ...result };
  }

  // Rota para listar turmas
  @Get()
  async listar(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROFESSOR') {
      throw new ForbiddenException('Você não tem permissão para visualizar as turmas.');
    }
    return this.turmasService.listarTodas();
  }

  // Busca as turmas do dia de hoje
  @Get('hoje')
  async turmaHoje(@Request() req) {
    if (req.user.role === 'ALUNO') {
      throw new ForbiddenException('Acesso restrito a professores.');
    }
    const professorId = req.user.sub;

    return this.turmasService.buscarTurmaHoje(professorId);
  }

  // ROta para atualizr o diario
  @Put('diario/:classLog/save')
  async atualizarDiario(
    @Param('classLog') classLogId: string,
    @Body()
    body: {
      dadosAula: {
        conteudoDado: string;
        obs: string;
        professorId: string;
        statusAula: string;
      };
      chamada: Array<{
        alunoId: any;
        status: string;
        observacao: string;
        licao_atual: string;
      }>;
    },
  ) {
    return this.turmasService.atualizarDiario(
      classLogId,
      body.dadosAula,
      body.chamada,
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id/historico')
  async verHistorico(@Param('id') turmaId: string) {
    return this.turmasService.listarHistorico(turmaId);
  }

  // ADMIN edita uma turma pelo id
  @Put(':id')
  async editar(@Request() req, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para Editar as turmas.');
    }
    return this.turmasService.editarTurma(id, body);
  }

  // ADMIN deleta uma turma pelo id
  @Delete(':id')
  async excluir(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para Excluir as turmas.');
    }
    await this.turmasService.deletarTurma(id);
    return { message: 'Turma excluída com sucesso.' };
  }

  @Delete('diario-aula/:classLogId')
  async apagarDiario(@Param('classLogId') classLogId: string, @Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PROFESSOR') {
      throw new ForbiddenException('Permissão insuficiente para excluir registros.');
    }
    return this.turmasService.deletarClassLog(classLogId);
  }
}
