import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TurmaDocument = Turma & Document;

@Schema({ timestamps: true }) // Salva automaticamente quando a turma foi criada/atualizada
export class Turma {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  professorId: Types.ObjectId;

  // Um array de textos para os dias. Ex: ['Segunda', 'Quarta']
  @Prop({ type: [String], required: true })
  diasAula: string[];

  @Prop({ required: true })
  horario: string; // Ex: '19:00 às 20:30'

  @Prop({ required: true })
  livroModulo: string;

  @Prop({ required: true })
  dataInicio: Date;

  @Prop({ required: true })
  dataFim: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  alunos: Types.ObjectId[];
}

export const TurmaSchema = SchemaFactory.createForClass(Turma);
