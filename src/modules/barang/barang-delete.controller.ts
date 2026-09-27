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
import { PrismaService } from '../../prisma.module.js';

@ApiTags('Barang')
@Controller('api/barang')
export class BarangDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus barang', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Barang' })
  async remove(@Param('id') id: string) {
    const barang = await this.prisma.barang.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!barang) {
      throw new NotFoundException('Barang tidak ditemukan');
    }

    if (barang._count.items > 0) {
      throw new BadRequestException(
        'Barang tidak dapat dihapus karena masih terkait dengan data pengadaan',
      );
    }

    await this.prisma.barang.delete({ where: { id } });

    return {
      status: 200,
      message: 'Barang berhasil dihapus',
      data: null,
    };
  }
}
