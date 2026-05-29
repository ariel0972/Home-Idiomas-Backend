import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassLogDocument = ClassLog & Document;

@Schema({ timestamps: true })
export class ClassLog {
  @Prop({ type: Types.ObjectId, ref: 'Turma', required: true })
  turmaId: Types.ObjectId;

  // Quem deu a aula de fato
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  professorId: Types.ObjectId;

  @Prop({ required: true })
  dataAula: Date;

  @Prop({
    required: true,
    enum: ['REALIZADA', 'FALTA_PROFESSOR', 'FALTA_ALUNOS', 'REMARCADA_ALUNO', 'FERIADO', 'AULA_EXTRA'],
    default: 'REALIZADA',
  })
  statusAula: string;

  @Prop()
  conteudoProposto: string; // O que estava no plano

  @Prop()
  conteudoDado: string; // O que realmente deu tempo de passar

  @Prop()
  dataReposicao: Date; // Preenchido apenas se o status for CANCELADA/REMARCADA

  @Prop()
  obs: string; // O "canto da página" para anotações rápidas
}

export const ClassLogSchema = SchemaFactory.createForClass(ClassLog);
