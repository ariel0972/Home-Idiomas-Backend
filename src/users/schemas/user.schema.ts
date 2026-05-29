import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

/*
 Nome completo
 Email
 Número do celular
 CPF
 Data de nascimento
 Número de matricula
 Senha
 Nome do responsavel
 Número do responsável
 Documento do responsável
 */

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true, sparse: true })
  email: string;

  @Prop({ required: true })
  senha: string;

  @Prop({
    required: true,
    enum: ['ALUNO', 'ADMIN', 'PROFESSOR'],
    default: 'ALUNO',
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Turma' })
  turmaId: string;

  @Prop({ default: 'L1' })
  licao_atual: string;

  @Prop({
    required: true,
    enum: ['ATIVO', 'INATIVO', 'RECENDIDO'],
    default: 'ATIVO',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['ATIVO', 'TRANSFERIDO', 'DESISTENTE'],
    default: 'ATIVO',
  })
  statusTurma: string;

  @Prop()
  nome_completo: string;

  @Prop()
  celular: string;

  @Prop()
  cpf: string;

  @Prop()
  rg: string;

  @Prop()
  nascimento: string;

  @Prop({ sparse: true, unique: true })
  matricula: string;

  @Prop()
  endereco: string;

  @Prop()
  nomeResponsavel: string;

  @Prop()
  celularResponsavel: string;

  @Prop()
  cpfResponsavel: string;

  @Prop()
  rgResponsavel: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
