import {
  Controller,
  Delete,
  Param,
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

@ApiTags('Pengadaan')
@Controller('api/pengadaan')
export class PengadaanDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus pengadaan', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Pengadaan' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const pengadaan = await this.prisma.pengadaan.findUnique({ where: { id } });
    if (!pengadaan) {
      throw new NotFoundException('Pengadaan tidak ditemukan');
    }

    if (!['draft', 'revisi', 'ditolak'].includes(pengadaan.status)) {
      throw new BadRequestException(
        'Pengadaan hanya dapat dihapus saat status draft, revisi, atau ditolak',
      );
    }

    // Audit log before delete
    await this.prisma.auditLog.create({
      data: {
        tabel: 'pengadaan',
        recordId: id,
        aksi: 'delete',
        dilakukanOleh: user.sub,
        dataSebelum: pengadaan as any,
        dataSesudah: null as any,
      },
    });

    // Cascade delete handled by Prisma schema
    await this.prisma.pengadaan.delete({ where: { id } });

    return {
      status: 200,
      message: 'Pengadaan berhasil dihapus',
      data: null,
    };
  }
}
