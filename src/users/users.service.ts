/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Turma, TurmaDocument } from '../turmas/schemas/turma.schema'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Turma.name) private turmaModel: Model<TurmaDocument>
  ) { }

  // Cria um novo aluno/admin no sistema
  async criarUsuario(dadosUsuario: Partial<User>): Promise<User> {
    if (!dadosUsuario.senha) {
      throw new BadRequestException('A senha é obrigatória para o registro.');
    }

    // 1. Verifica se o email já existe para evitar duplicações
    const usuarioExistente = await this.userModel.findOne({
      email: dadosUsuario.email,
    });
    if (usuarioExistente) {
      throw new ConflictException('Esse email já está cadastrado na escola.');
    }

    // 2. Criptografa a senha. O '10' é o salt rounds (o padrão ideal de segurança/performance)
    const senhaHasheada = await bcrypt.hash(dadosUsuario.senha, 10);

    // 3. Salva no banco com a senha protegida
    const novoUsuario = new this.userModel({
      ...dadosUsuario,
      senha: senhaHasheada,
    });

    return novoUsuario.save();
  }

  // Busca o usuário pelo email (usado na hora do login)
  async buscarPorEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async listarTodosAlunos() {
    return this.userModel.find({ role: 'ALUNO' }).select('-senha').exec();
  }

  async listarTodosUsuarios() {
    return this.userModel.find().select('-senha').exec();
  }

  // 2. Atualiza os dados de um aluno específico
  async atualizarUsuario(id: string, dados: any) {
    if (dados.status === 'INATIVO') {
      const usuarioOriginal = await this.userModel.findById(id);

      if (usuarioOriginal && usuarioOriginal.turmaId) {
        // Agora usamos o turmaModel limpo e tipado!
        // Como o Mongoose já sabe que "alunos" é um array de ObjectIds, ele faz o cast automático.
        await this.turmaModel.findByIdAndUpdate(
          usuarioOriginal.turmaId,
          { $pull: { alunos: new Types.ObjectId(id) } } as any // O "as any" é o truque final caso o TS reclame da sintaxe do $pull
        ).exec();

        dados.turmaId = null;
      }
    }

    if (dados.senha) {
      const salt = await bcrypt.genSalt();
      dados.senha = await bcrypt.hash(dados.senha, salt);
    }

    return this.userModel.findByIdAndUpdate(id, { $set: dados }, { new: true }).select('-senha').exec();
  }

  // 3. Exclui um aluno do sistema
  async deletarAluno(id: string) {
    // Passo 1: Busca o usuário antes da exclusão para sabermos os vínculos dele
    const usuarioOriginal = await this.userModel.findById(id);

    if (usuarioOriginal) {
      // Se for um ALUNO com turma, removemos o ID dele da lista de alunos da turma
      if (usuarioOriginal.role === 'ALUNO' && usuarioOriginal.turmaId) {
        await this.turmaModel.findByIdAndUpdate(
          usuarioOriginal.turmaId,
          { $pull: { alunos: new Types.ObjectId(id) } } as any
        ).exec();
      }

      // Se for um PROFESSOR, removemos ele do cargo em qualquer turma que ele dava aula
      if (usuarioOriginal.role === 'PROFESSOR') {
        await this.turmaModel.updateMany(
          { professorId: new Types.ObjectId(id) },
          { $unset: { professorId: "" } } // Deixa a turma temporariamente sem professor
        ).exec();
      }
    }

    // Passo 2: Agora sim, com os dados fantasmas eliminados, apagamos o documento principal
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async pesquisarUsuario(termo: string) {
    if (!termo || termo.trim() === '') {
      return this.userModel.find({
        status: { $ne: 'INATIVO' }
      }).select('-senha').exec();
    }

    const regex = new RegExp(termo, 'i')

    return this.userModel.find({
      $or:[
        { nome: regex },
        { nome_completo: regex },
        { email: regex },
        { cpf: regex },
        { rg: regex },
        { matricula: regex },
      ]
    }).select('-senha').exec();
  }
}
