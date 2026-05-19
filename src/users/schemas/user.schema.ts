import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  senha: string; // Receberá o hash do bcrypt depois

  @Prop({ required: true, enum: ['ALUNO', 'ADMIN'], default: 'ALUNO' })
  role: string;

  // Campos específicos do aluno (podem ser nulos para ADMIN)
  @Prop()
  turma: string; // Ex: Módulo 1

  @Prop()
  professor: string;

  @Prop({ default: 1 })
  licao_atual: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
