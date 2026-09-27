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

@ApiTags('Kategori Pengadaan')
@Controller('api/kategori')
export class KategoriDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus kategori', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Kategori' })
  async remove(@Param('id') id: string) {
    const kategori = await this.prisma.kategoriPengadaan.findUnique({
      where: { id },
      include: { _count: { select: { barang: true } } },
    });
    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (kategori._count.barang > 0) {
      throw new BadRequestException(
        'Kategori tidak dapat dihapus karena masih memiliki barang',
      );
    }

    await this.prisma.kategoriPengadaan.delete({ where: { id } });

    return {
      status: 200,
      message: 'Kategori berhasil dihapus',
      data: null,
    };
  }
}
