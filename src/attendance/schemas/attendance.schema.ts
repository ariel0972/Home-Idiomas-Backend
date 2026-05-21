import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  alunoId: Types.ObjectId;

  @Prop({ required: true })
  data: Date;

  @Prop({ type: Types.ObjectId, ref: 'Turma', required: true })
  turmaId: string;

  @Prop({
    enum: ['QRCODE', 'MANUAL'],
    default: 'QRCODE',
  })
  metodo: string;

  @Prop({ default: 'Não informada' })
  localizacao: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
