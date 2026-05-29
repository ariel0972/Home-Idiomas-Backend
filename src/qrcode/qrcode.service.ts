import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrcodeService {
  async generateStaticQrCode(): Promise<string> {
    const QrHoje = new Date().toISOString().split('T')[0];

    const payload = JSON.stringify({
      action: 'check-in',
      location: 'sede-principal',
      version: '1.0',
      dataGenarate: QrHoje,
    });

    try {
      // O toDataURL gera automaticamente no formato: data:image/png;base64,iVBORw0KGgo...
      const qrCodeBase64 = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M', // Nível médio, facilita a leitura por câmeras ruins
        margin: 2,
        width: 300,
      });
      return qrCodeBase64;
    } catch (error) {
      throw new InternalServerErrorException(
        'Falha ao gerar o QR Code de presença',
      );
    }
  }
}
