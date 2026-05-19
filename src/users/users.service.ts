/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  // 2. Atualiza os dados de um aluno específico
  async atualizarAluno(id: string, dadosAtualizacao: Partial<User>) {
    // O { new: true } faz o Mongoose devolver o aluno já atualizado
    return this.userModel.findByIdAndUpdate(id, dadosAtualizacao, { new: true }).select('-senha').exec();
  }

  // 3. Exclui um aluno do sistema
  async deletarAluno(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
