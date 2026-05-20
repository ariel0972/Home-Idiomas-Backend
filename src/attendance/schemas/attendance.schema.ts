import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  // Referência direta ao ID do aluno na coleção de usuários
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  alunoId: Types.ObjectId;

  @Prop({ required: true })
  data: Date; // A data exata da leitura

  // Salvamos uma cópia da turma e do professor no momento da presença.
  // Isso é realista: se o aluno mudar de turma no ano que vem,
  // o histórico de presenças antigas não quebra.
  @Prop({ type: Types.ObjectId, ref: 'Turma', required: true })
  turmaId: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
