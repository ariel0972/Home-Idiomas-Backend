/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Turma, TurmaDocument } from './schemas/turma.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ClassLog, ClassLogDocument } from './schemas/class-log.schema';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema'
import { CriarTurmaDto } from './dto/turma.dto';

@Injectable()
export class TurmasService {
  constructor(
    @InjectModel(Turma.name) private turmaModel: Model<TurmaDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ClassLog.name) private classLogModel: Model<ClassLogDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) { }

  // Cria uma nova turma
  async criarTurma(criarTurmaDto: CriarTurmaDto): Promise<Turma> {
    let statusTurma = 'ATIVA';

    if (criarTurmaDto.dataInicio) {
      const dataInicio = new Date(criarTurmaDto.dataInicio);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataInicio > hoje) {
        statusTurma = 'EM ESPERA';
      }
    }

    const novaTurma = new this.turmaModel({
      ...criarTurmaDto,
      status: statusTurma,
    });

    const turmaSalva = await novaTurma.save();

    if (criarTurmaDto.alunos && criarTurmaDto.alunos.length > 0) {
      await this.userModel.updateMany(
        { _id: { $in: criarTurmaDto.alunos } },
        { $set: { turmaId: turmaSalva._id } },
      );
    }

    return turmaSalva;
  }

  // Lista todas as turmas
  async listarTodas(): Promise<Turma[]> {
    return this.turmaModel
      .find()
      .populate('professorId', 'nome email')
      .populate('alunos', 'nome email licao_atual status') // Busca na tabela de Users apenas nome e email dos alunos do array
      .exec();
  }

  // Deleta uma turma pelo Id
  async deletarTurma(id: string) {
    // 1. Busca a turma antes de apagar para sabermos quem estudava lá
    const turma = await this.turmaModel.findById(id);
    if (turma && turma.alunos && turma.alunos.length > 0) {
      await this.userModel.updateMany(
        { _id: { $in: turma.alunos } },
        { $unset: { turmaId: '' } },
      );
    }

    // 3. Finalmente, deleta a turma
    return this.turmaModel.findByIdAndDelete(id).exec();
  }

  // Editar uma turma pelo Id
  async editarTurma(id: string, body: Partial<Turma>) {
    const turmaAntiga = await this.turmaModel.findById(id).exec();

    const alunosAntigos = turmaAntiga?.alunos ? turmaAntiga.alunos.map(a => a.toString()) : [];
    const alunosNovos = body?.alunos ? body.alunos.map(a => a.toString()) : [];

    const alunosRemovidos = alunosAntigos.filter(a => !alunosNovos.includes(a));

    if (alunosRemovidos.length > 0) {
      await this.turmaModel.updateMany(
        { _id: { $in: alunosRemovidos } },
        { $unset: { turmaId: '' } },
      );
    }

    const turmaAtualizada = await this.turmaModel
      .findByIdAndUpdate(id, body, { returnDocument: 'after' })
      .exec();

    if (body.alunos && body.alunos.length > 0) {
      await this.userModel.updateMany(
        { _id: { $in: body.alunos } },
        { $set: { turmaId: id } },
      );
    }

    return turmaAtualizada;
  }

  // Buscar turmas do profesor que ele tem aual no dia
  async buscarTurmaHoje(professorId: string): Promise<Turma[]> {
    const diasdaSemana = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];
    const hoje = diasdaSemana[new Date().getDay()];

    return this.turmaModel
      .find({
        professorId: new Types.ObjectId(professorId),
        status: 'ATIVA',
        diasAula: { $in: [hoje] },
      })
      .populate('alunos', 'nome email licao_atual')
      .exec();
  }

  //Cria um log de aula
  async buscarClassLog(turmaId: string, dataParam?: string) {
    const dataAlvo = dataParam ? new Date(dataParam + 'T12:00:00') : new Date();

    const inicio = new Date(dataAlvo);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(dataAlvo);
    fim.setHours(23, 59, 59, 999);

    const aula = await this.classLogModel
      .findOne({
        turmaId: new Types.ObjectId(turmaId),
        dataAula: { $gte: inicio, $lte: fim },
      })
      .exec();

    if (!aula) {
      return null;
    }

    const presenca = await this.attendanceModel
      .find({
        classLogId: aula._id,
      })
      .exec();

    return { aula, presenca };
  }

  async iniciarClassLog(
    turmaId: string,
    profesorId: string,
    dataParam?: string,
  ) {
    const dataAlvo = dataParam ? new Date(dataParam + 'T12:00:00') : new Date();

    const novaAula = new this.classLogModel({
      turmaId: new Types.ObjectId(turmaId),
      professorId: new Types.ObjectId(profesorId),
      dataAula: dataAlvo,
      statusAula: 'REALIZADA',
      conteudoProposto: '',
      conteudoDado: '',
      obs: '',
      // eu t amu
    });

    await novaAula.save();
    return { aula: novaAula, presencaLancada: [] };
  }

  // Atualiza o classLog
  async atualizarDiario(
    classLogId: string,
    dadosAula: { conteudoDado: string; obs: string; professorId?: string; statusAula?: string },
    chamada: Array<{
      alunoId: any;
      status: string;
      observacao: string;
      licao_atual: string;
    }>,
  ) {
    const updateData: any = {
      conteudoDado: dadosAula.conteudoDado,
      obs: dadosAula.obs,
    };

    if (dadosAula.statusAula) {
      updateData.statusAula = dadosAula.statusAula;
    }

    // 🛡️ ESCUDO 1: Só converte o professorId se ele for um texto válido de 24 caracteres
    if (dadosAula.professorId && Types.ObjectId.isValid(dadosAula.professorId.toString())) {
      updateData.professorId = new Types.ObjectId(dadosAula.professorId.toString());
    }

    const aula = await this.classLogModel.findByIdAndUpdate(
      classLogId,
      updateData,
      { returnDocument: 'after' },
    );

    if (!aula) throw new NotFoundException('Aula não localizada.');

    for (const registro of chamada) {
      // 🛡️ ESCUDO 2: Extrai o ID puro caso o frontend mande um objeto sem querer
      const idDoAluno = typeof registro.alunoId === 'object' && registro.alunoId !== null 
        ? registro.alunoId._id 
        : registro.alunoId;

      // Pula e ignora se o ID for inválido (evita o erro 500)
      if (!idDoAluno || !Types.ObjectId.isValid(idDoAluno.toString())) {
        console.warn(`⚠️ ID de aluno inválido ignorado: ${idDoAluno}`);
        continue;
      }

      // 1. Atualiza a lição atual no perfil do aluno
      await this.userModel.findByIdAndUpdate(idDoAluno, { licao_atual: registro.licao_atual });

      // 2. Salva a presença no banco
      await this.attendanceModel.findOneAndUpdate(
        { classLogId: aula._id, alunoId: new Types.ObjectId(idDoAluno.toString()) },
        {
          turmaId: aula.turmaId,
          data: aula.dataAula,
          $setOnInsert: { metodo: 'MANUAL' },
          $set: {
            status: registro.status,
            observacao: registro.observacao,
          }
        },
        { upsert: true, new: true },
      );
    }

    return { success: true, message: 'Diário de classe salvo com sucesso!' };
  }

  // Deleta o classLog e limpa as presenças
  async deletarClassLog(classLogId: string) {
    await this.attendanceModel.deleteMany({ classLogId: new Types.ObjectId(classLogId) }).exec();
    return this.classLogModel.findByIdAndDelete(classLogId).exec();
  }

  // Lista todo o histórico de aulas de uma turma específica
  async listarHistorico(turmaId: string) {
    const historico = await this.classLogModel.find({ turmaId: new Types.ObjectId(turmaId) })
      .sort({ dataAula: -1 }) // -1 traz da mais recente para a mais antiga
      .populate('professorId', 'nome') // Traz o nome de quem deu a aula
      .lean()
      .exec();

    const freq = await Promise.all(historico.map(async (aula) => {
        const presentes = await this.attendanceModel.countDocuments({
          classLogId: aula._id,
          status: { $in: ['PRESENTE', 'ATRASO'] }
        });

        return {
          ...aula,
          presentes,
        };
      }),
    );

    return freq;
  }

  async buscarTurmaDoAluno(alunoId: string) {
    const aluno = await this.userModel.findById(alunoId).exec();
    if (!aluno || !aluno.turmaId) return null;
    // Retorna os dados completos da turma dele
    return this.turmaModel.findById(aluno.turmaId).exec();
  }
}
