import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { PengadaanService } from './pengadaan.service.js';
import { CreatePengadaanDto } from './pengadaan.dto.js';

@ApiTags('Pengadaan')
@Controller('api/pengadaan')
export class PengadaanPostController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pengadaanService: PengadaanService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiRoles('Buat pengadaan baru', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() dto: CreatePengadaanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Pengadaan minimal harus memiliki 1 item');
    }

    // Validate all barang exist
    const barangIds = dto.items.map((i) => i.barangId);
    const barangCount = await this.prisma.barang.count({
      where: { id: { in: barangIds } },
    });
    if (barangCount !== barangIds.length) {
      throw new BadRequestException('Salah satu barang tidak ditemukan');
    }

    // Validate vendor if provided
    const vendorIds = dto.items
      .filter((i) => i.vendorId)
      .map((i) => i.vendorId!);
    if (vendorIds.length > 0) {
      const vendorCount = await this.prisma.vendor.count({
        where: { id: { in: vendorIds } },
      });
      if (vendorCount !== vendorIds.length) {
        throw new BadRequestException('Salah satu vendor tidak ditemukan');
      }
    }

    const nomorSurat = await this.pengadaanService.generateNomorSurat();
    const totalEstimasi = this.pengadaanService.calculateTotalEstimasi(
      dto.items,
    );

    // Create pengadaan with items in transaction
    const pengadaan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.pengadaan.create({
        data: {
          nomorSurat,
          judul: dto.judul,
          deskripsi: dto.deskripsi,
          metode: dto.metode,
          prioritas: dto.prioritas ?? 'sedang',
          status: 'draft',
          tanggalPengajuan: dto.tanggalPengajuan
            ? new Date(dto.tanggalPengajuan)
            : null,
          tanggalDeadline: dto.tanggalDeadline
            ? new Date(dto.tanggalDeadline)
            : null,
          totalEstimasi,
          unitKerja: dto.unitKerja ?? user.unitKerja,
          diajukanOleh: user.sub,
          items: {
            create: dto.items.map((item) => ({
              barangId: item.barangId,
              vendorId: item.vendorId,
              jumlah: item.jumlah,
              hargaSatuan: item.hargaSatuan,
              subtotal: (item.hargaSatuan || 0) * item.jumlah,
              catatan: item.catatan,
            })),
          },
        },
        include: {
          items: { include: { barang: true, vendor: true } },
          diajukanOlehUser: { select: { id: true, nama: true, email: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tabel: 'pengadaan',
          recordId: created.id,
          aksi: 'create',
          dilakukanOleh: user.sub,
          dataSebelum: null as any,
          dataSesudah: created as any,
        },
      });

      return created;
    });

    return {
      status: 201,
      message: 'Pengadaan berhasil dibuat',
      data: pengadaan,
    };
  }
}
