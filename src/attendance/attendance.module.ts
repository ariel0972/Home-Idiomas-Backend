import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { UsersModule } from 'src/users/users.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { ClassLog, ClassLogSchema } from 'src/turmas/schemas/class-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: ClassLog.name, schema: ClassLogSchema },
    ]),
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
