import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turma, TurmaDocument } from './schemas/turma.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CriarTurmaDto } from './dto/turma.dto';

@Injectable()
export class TurmasService {
  constructor(
    @InjectModel(Turma.name) private turmaModel: Model<TurmaDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Cria uma nova turma
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
        { $unset: { turmaId: "" } },
      );
    }

    // 3. Finalmente, deleta a turma
    return this.turmaModel.findByIdAndDelete(id).exec();
  }

  async editarTurma(id: string, body: Partial<Turma>) {
    const turmaAtualizada = await this.turmaModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();

    // Se o Admin enviou uma nova lista de alunos na edição, sincroniza os perfis!
    if (body.alunos && body.alunos.length > 0) {
      await this.userModel.updateMany(
        { _id: { $in: body.alunos } },
        { $set: { turmaId: id } }, // Garante que os novos alunos apontem para cá
      );
    }

    return turmaAtualizada;
  }
}
