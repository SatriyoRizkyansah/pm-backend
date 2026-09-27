import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.module.js';
import { PengadaanItemDto } from './pengadaan.dto.js';

@Injectable()
export class PengadaanService {
  private readonly logger = new Logger(PengadaanService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate nomor surat otomatis: PGD-YYYYMMDD-XXXX
   */
  async generateNomorSurat(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PGD-${dateStr}`;

    const last = await this.prisma.pengadaan.findFirst({
      where: { nomorSurat: { startsWith: prefix } },
      orderBy: { nomorSurat: 'desc' },
    });

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(last.nomorSurat.split('-').pop() || '0', 10);
      seq = lastSeq + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  /**
   * Hitung total estimasi dari items
   */
  calculateTotalEstimasi(items: PengadaanItemDto[]): number {
    return items.reduce((sum, item) => {
      const subtotal = (item.hargaSatuan || 0) * item.jumlah;
      return sum + subtotal;
    }, 0);
  }
}
