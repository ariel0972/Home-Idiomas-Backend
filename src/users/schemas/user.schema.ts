import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
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

  @Prop({ required: true, enum: ['ATIVO', 'INATIVO'], default: 'ATIVO' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
