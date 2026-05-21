/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async baterPresenca(alunoId: string, payloadQrCode: any, localizacao?: string) {
    if (
      payloadQrCode.action !== 'check-in' ||
      payloadQrCode.location !== 'sede-principal'
    ) {
      throw new BadRequestException(
        'Este QR Code não pertence ao sistema da escola.',
      );
    }

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    const jaRegistrou = await this.attendanceModel.findOne({
      alunoId: new Types.ObjectId(alunoId),
      data: { $gte: inicioDia, $lte: fimDia },
    });

    if (jaRegistrou) {
      throw new BadRequestException(
        'Sua presença já foi contabilizada no dia de hoje!',
      );
    }

    const aluno = await this.userModel.findById(alunoId);
    if (!aluno) {
      throw new BadRequestException('Aluno não localizado no sistema.');
    }

    const novaPresenca = new this.attendanceModel({
      alunoId: new Types.ObjectId(alunoId),
      data: new Date(),
      turmaId: aluno.turmaId || null,
      metodo: 'QRCODE',
      localizacao: localizacao || 'Não nao autorizada',
    });

    await novaPresenca.save();

    return {
      success: true,
      message: `Presença confirmada com sucesso!`,
      aluno: aluno.nome,
    };
  }

  async listarPresencasDoDia(inicio?: string, fim?: string) {
    const query: any = {};

    if (inicio && fim) {
      query.data = {
        $gte: new Date(inicio),
        $lte: new Date(fim),
      };
    } else {
      const hojeInicio = new Date();
      hojeInicio.setHours(0, 0, 0, 0);
      const hojeFim = new Date();
      hojeFim.setHours(23, 59, 59, 999);

      query.data = {
        $gte: hojeInicio,
        $lte: hojeFim,
      };
    }

    return this.attendanceModel
      .find(query)
      .populate('alunoId', 'nome')
      .populate({
        path: 'turmaId',
        select: 'livroModulo horario professorId',
        populate: {
          path: 'professorId',
          select: 'nome',
        },
      })
      .sort({ data: -1 })
      .exec();
  }

  async registrarPresencaManual(alunoId: string, dataAula: string) {
    const aluno = await this.userModel.findById(alunoId);
    if (!aluno) {
      throw new BadRequestException('Aluno não localizado no sistema.');
    }

    const dataRegistro = new Date(dataAula + 'T12:00:00');
    const inicioDia = new Date(dataRegistro);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataRegistro);
    fimDia.setHours(23, 59, 59, 999);

    const jaRegistrou = await this.attendanceModel.findOne({
      alunoId: new Types.ObjectId(alunoId),
      data: { $gte: inicioDia, $lte: fimDia },
    });

    if (jaRegistrou) {
      throw new BadRequestException(
        'Este aluno já possui presença registrada neste dia.',
      );
    }

    const novaPresenca = new this.attendanceModel({
      alunoId: new Types.ObjectId(alunoId),
      data: dataRegistro,
      turmaId: aluno.turmaId || null,
      metodo: 'MANUAL',
    });

    await novaPresenca.save();
    return {
      success: true,
      message: 'Presença manual registrada com sucesso!',
    };
  }
}
