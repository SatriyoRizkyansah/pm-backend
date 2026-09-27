import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.module.js';

@Injectable()
export class NotifikasiService {
  private readonly logger = new Logger(NotifikasiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification for a user
   */
  async create(params: {
    userId: string;
    pesan: string;
    pengadaanId?: string;
    referensiTabel?: string;
    referensiId?: string;
  }) {
    return this.prisma.notifikasi.create({
      data: {
        userId: params.userId,
        pesan: params.pesan,
        pengadaanId: params.pengadaanId,
        referensiTabel: params.referensiTabel ?? 'pengadaan',
        referensiId: params.referensiId ?? params.pengadaanId ?? '',
      },
    });
  }

  /**
   * Notify all users with a specific role
   */
  async notifyRole(params: {
    roleKode: string;
    pesan: string;
    pengadaanId?: string;
  }) {
    const role = await this.prisma.role.findFirst({
      where: { kode: params.roleKode },
    });
    if (!role) return;

    const users = await this.prisma.user.findMany({
      where: { roleId: role.id, status: 'aktif' },
      select: { id: true },
    });

    for (const user of users) {
      await this.create({
        userId: user.id,
        pesan: params.pesan,
        pengadaanId: params.pengadaanId,
      });
    }
  }
}
