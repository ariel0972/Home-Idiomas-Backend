import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turma, TurmaDocument } from './schemas/turma.schema';
import { User, UserDocument } from '../users/schemas/user.schema'
import { CriarTurmaDto } from './dto/turma.dto';

@Injectable()
export class TurmasService {
  constructor(
    @InjectModel(Turma.name) private turmaModel: Model<TurmaDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  // 1. Cria uma nova turma no banco
  async criarTurma(criarTurmaDto: CriarTurmaDto): Promise<Turma> {
    const novaTurma = new this.turmaModel(criarTurmaDto);
    const turmaSalva = await novaTurma.save();

    if (criarTurmaDto.alunos && criarTurmaDto.alunos.length > 0) {
      await this.userModel.updateMany(
        { _id: { $in: criarTurmaDto.alunos } },
        { $set: { turmaId: turmaSalva._id } },
      );
    }

    return turmaSalva;
  }

  // 2. Lista todas as turmas e já traz os dados dos alunos vinculados de forma automática
  async listarTodas(): Promise<Turma[]> {
    return this.turmaModel
      .find()
      .populate('professorId', 'nome email')
      .populate('alunos', 'nome email') // Busca na tabela de Users apenas nome e email dos alunos do array
      .exec();
  }
}
