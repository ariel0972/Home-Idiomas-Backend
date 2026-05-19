/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(AuthGuard)
  @Post('scan')
  async registrarPresenca(@Request() req, @Body() body: { qrCodeContent: string }) {
    const payloadQrCode = JSON.parse(body.qrCodeContent);
    const alunoId = req.user.sub; 

    return this.attendanceService.baterPresenca(alunoId, payloadQrCode);
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
