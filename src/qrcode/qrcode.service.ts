import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrcodeService {
  async generateStaticQrCode(): Promise<string> {
    // Para esse MVP, o payload é fixo (papel impresso na parede).
    // Uma dica realista: inclua uma "version". Se um dia você precisar trocar
    // o papel colado na escola porque alguém vazou o código, você muda a versão aqui.
    const payload = JSON.stringify({
      action: 'check-in',
      location: 'sede-principal',
      version: '1.0',
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
