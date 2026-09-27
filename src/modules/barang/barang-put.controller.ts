import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { UpdateBarangDto } from './barang.dto.js';

@ApiTags('Barang')
@Controller('api/barang')
export class BarangPutController {
  constructor(private readonly prisma: PrismaService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiRoles('Update barang', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Barang' })
  async update(@Param('id') id: string, @Body() dto: UpdateBarangDto) {
    const existing = await this.prisma.barang.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Barang tidak ditemukan');
    }

    if (dto.kategoriId) {
      const kategori = await this.prisma.kategoriPengadaan.findUnique({
        where: { id: dto.kategoriId },
      });
      if (!kategori) {
        throw new NotFoundException('Kategori pengadaan tidak ditemukan');
      }
    }

    const barang = await this.prisma.barang.update({
      where: { id },
      data: dto,
      include: { kategori: { select: { id: true, kode: true, nama: true } } },
    });

    return {
      status: 200,
      message: 'Barang berhasil diupdate',
      data: barang,
    };
  }
}
