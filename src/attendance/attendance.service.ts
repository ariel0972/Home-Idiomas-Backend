/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ClassLog, ClassLogDocument } from 'src/turmas/schemas/class-log.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ClassLog.name) private classLogModel: Model<ClassLogDocument>,
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

    const dataHoje = new Date().toISOString().split('T')[0];
    if (payloadQrCode.QrHoje !== dataHoje) {
      throw new BadRequestException('❌ Este QR Code expirou! Solicite ao professor que abra o código de hoje na lousa.');
    }

    const aluno = await this.userModel.findById(alunoId);
    if (!aluno) {
      throw new BadRequestException('Aluno não localizado no sistema.');
    }

    if (!aluno.turmaId) {
      throw new BadRequestException('Você não está vinculado a nenhuma turma ativa.');
    }

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    // 1. Verifica duplicidade de presença
    const jaRegistrou = await this.attendanceModel.findOne({
      alunoId: new Types.ObjectId(alunoId),
      data: { $gte: inicioDia, $lte: fimDia },
    });

    if (jaRegistrou) {
      throw new BadRequestException(
        'Sua presença já foi contabilizada no dia de hoje!',
      );
    }

    // 2. 🚨 CORREÇÃO: Busca se o professor já iniciou o diário de hoje para esta turma
    const diarioDeHoje = await this.classLogModel.findOne({
      turmaId: aluno.turmaId,
      dataAula: { $gte: inicioDia, $lte: fimDia }
    });

    if (!diarioDeHoje) {
      throw new BadRequestException(
        'Aguarde o professor iniciar a aula no sistema antes de bater a presença!'
      );
    }

    // 3. Salva a presença injetando o classLogId obrigatório para evitar o Erro 500
    const novaPresenca = new this.attendanceModel({
      alunoId: new Types.ObjectId(alunoId),
      classLogId: diarioDeHoje._id, // 👈 Campo obrigatório preenchido!
      data: new Date(),
      turmaId: aluno.turmaId,
      metodo: 'QRCODE',
      localizacao: localizacao || 'Não autorizada',
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

  async atualizarPresenca(id: string, dados: any) {
    return this.attendanceModel.findByIdAndUpdate(id, dados, { new: true });
  }

  async deletarPresenca(id: string) {
    return this.attendanceModel.findByIdAndDelete(id);
  }
}
