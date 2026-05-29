import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  alunoId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Turma', required: true })
  turmaId: string;

  @Prop({ type: Types.ObjectId, ref: 'ClassLog', required: true })
  classLogId: Types.ObjectId;

  @Prop({ required: true })
  data: Date;

  @Prop({
    enum: ['QRCODE', 'MANUAL'],
    default: 'QRCODE',
  })
  metodo: string;

  @Prop({
    required: true,
    enum: ['PRESENTE', 'ATRASO', 'FALTA', 'REPOSIÇÃO', 'AULA_EXTRA'],
    default: 'PRESENTE',
  })
  status: string;

  @Prop({ default: 'Não informada' })
  localizacao: string;

  @Prop({ default: '' })
  obs: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
