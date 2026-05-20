import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurmasService } from './turmas.service';
import { TurmasController } from './turmas.controller';
import { Turma, TurmaSchema } from './schemas/turma.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Turma.name, schema: TurmaSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
