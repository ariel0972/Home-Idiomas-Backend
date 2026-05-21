/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @UseGuards(AuthGuard)
  @Post('scan')
  async registrarPresenca(@Request() req, @Body() body: { qrCodeContent: string, localizacao: string }) {
    const payloadQrCode = JSON.parse(body.qrCodeContent);
    const alunoId = req.user.sub;

    return this.attendanceService.baterPresenca(alunoId, payloadQrCode, body.localizacao);
  }

  @UseGuards(AuthGuard)
  @Post('manual')
  async presencaManual(@Request() req, @Body() body: { alunoId: string, data: string }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem lançar presenças manuais.')
    }

    return this.attendanceService.registrarPresencaManual(body.alunoId, body.data)
  }

  @UseGuards(AuthGuard)
  @Get('list')
  async obterListaDeHoje(
    @Request() req,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem visualizar o relatório de chamadas.');
    }
    // Repassamos as variáveis para o Service
    return this.attendanceService.listarPresencasDoDia(inicio, fim);
  }
}
