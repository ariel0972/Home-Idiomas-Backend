import { Controller, Get } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('generate')
  async generate() {
    const qrCodeImage = await this.qrcodeService.generateStaticQrCode();
    return {
      success: true,
      data: qrCodeImage,
      message: 'QR Code estático gerado com sucesso.',
    };
  }
}
