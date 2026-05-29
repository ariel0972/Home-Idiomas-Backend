import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurmasService } from './turmas.service';
import { TurmasController } from './turmas.controller';
import { Turma, TurmaSchema } from './schemas/turma.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ClassLog, ClassLogSchema } from './schemas/class-log.schema';
import { Attendance, AttendanceSchema } from 'src/attendance/schemas/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Turma.name, schema: TurmaSchema },
      { name: User.name, schema: UserSchema },
      { name: ClassLog.name, schema: ClassLogSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
