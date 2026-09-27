import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { PengadaanService } from './pengadaan.service.js';
import { UpdatePengadaanDto } from './pengadaan.dto.js';

@ApiTags('Pengadaan')
@Controller('api/pengadaan')
export class PengadaanPutController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pengadaanService: PengadaanService,
  ) {}

  @Put(':id')
  @HttpCode(200)
  @ApiRoles('Update pengadaan', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Pengadaan' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePengadaanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const existing = await this.prisma.pengadaan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Pengadaan tidak ditemukan');
    }

    // Only allow edit on draft/revisi
    if (!['draft', 'revisi'].includes(existing.status)) {
      throw new BadRequestException(
        'Pengadaan hanya dapat diedit saat status draft atau revisi',
      );
    }

    const { items, ...dataDto } = dto;

    const updateData: any = { ...dataDto };
    if (dto.tanggalPengajuan) {
      updateData.tanggalPengajuan = new Date(dto.tanggalPengajuan);
    }
    if (dto.tanggalDeadline) {
      updateData.tanggalDeadline = new Date(dto.tanggalDeadline);
    }

    const pengadaan = await this.prisma.$transaction(async (tx) => {
      // Replace items if provided
      if (items && items.length > 0) {
        // Delete old items
        await tx.pengadaanItem.deleteMany({ where: { pengadaanId: id } });

        // Create new items
        await tx.pengadaanItem.createMany({
          data: items.map((item) => ({
            pengadaanId: id,
            barangId: item.barangId,
            vendorId: item.vendorId,
            jumlah: item.jumlah,
            hargaSatuan: item.hargaSatuan,
            subtotal: (item.hargaSatuan || 0) * item.jumlah,
            catatan: item.catatan,
          })),
        });

        // Recalculate total
        updateData.totalEstimasi =
          this.pengadaanService.calculateTotalEstimasi(items);
      }

      const updated = await tx.pengadaan.update({
        where: { id },
        data: updateData,
        include: {
          items: { include: { barang: true, vendor: true } },
          diajukanOlehUser: { select: { id: true, nama: true, email: true } },
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          tabel: 'pengadaan',
          recordId: id,
          aksi: 'update',
          dilakukanOleh: user.sub,
          dataSebelum: existing as any,
          dataSesudah: updated as any,
        },
      });

      return updated;
    });

    return {
      status: 200,
      message: 'Pengadaan berhasil diupdate',
      data: pengadaan,
    };
  }
}
