import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { TurmasModule } from './turmas/turmas.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Conectando ao MongoDB. Se usar o Atlas, é só trocar a string aqui.
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    AttendanceModule,
    QrcodeModule,
    TurmasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
