import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { PrismaService } from '../../prisma.module.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Statistik dashboard' })
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPengadaan,
      pengadaanDraft,
      pengadaanDiajukan,
      pengadaanDalamReview,
      pengadaanDisetujui,
      pengadaanDitolak,
      pengadaanSelesai,
      totalVendor,
      totalBarang,
      totalUser,
      pengadaanBulanIni,
      recentPengadaan,
      approvalPending,
    ] = await Promise.all([
      this.prisma.pengadaan.count(),
      this.prisma.pengadaan.count({ where: { status: 'draft' } }),
      this.prisma.pengadaan.count({ where: { status: 'diajukan' } }),
      this.prisma.pengadaan.count({ where: { status: 'dalam_review' } }),
      this.prisma.pengadaan.count({ where: { status: 'disetujui' } }),
      this.prisma.pengadaan.count({ where: { status: 'ditolak' } }),
      this.prisma.pengadaan.count({ where: { status: 'selesai' } }),
      this.prisma.vendor.count({ where: { status: 'aktif' } }),
      this.prisma.barang.count(),
      this.prisma.user.count({ where: { status: 'aktif' } }),
      this.prisma.pengadaan.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.pengadaan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nomorSurat: true,
          judul: true,
          status: true,
          metode: true,
          prioritas: true,
          createdAt: true,
          diajukanOlehUser: { select: { nama: true } },
        },
      }),
      this.prisma.approvalWorkflow.count({
        where: { status: 'menunggu' },
      }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil statistik dashboard',
      data: {
        pengadaan: {
          total: totalPengadaan,
          draft: pengadaanDraft,
          diajukan: pengadaanDiajukan,
          dalam_review: pengadaanDalamReview,
          disetujui: pengadaanDisetujui,
          ditolak: pengadaanDitolak,
          selesai: pengadaanSelesai,
          bulan_ini: pengadaanBulanIni,
        },
        master: {
          vendor_aktif: totalVendor,
          total_barang: totalBarang,
          user_aktif: totalUser,
        },
        approval_pending: approvalPending,
        recent_pengadaan: recentPengadaan,
      },
    };
  }
}
