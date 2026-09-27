import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { UpdateKategoriDto } from './kategori.dto.js';

@ApiTags('Kategori Pengadaan')
@Controller('api/kategori')
export class KategoriPutController {
  constructor(private readonly prisma: PrismaService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiRoles('Update kategori', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Kategori' })
  async update(@Param('id') id: string, @Body() dto: UpdateKategoriDto) {
    const existing = await this.prisma.kategoriPengadaan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (dto.kode && dto.kode !== existing.kode) {
      const duplicate = await this.prisma.kategoriPengadaan.findFirst({
        where: { kode: dto.kode, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Kode kategori sudah digunakan');
      }
    }

    const kategori = await this.prisma.kategoriPengadaan.update({
      where: { id },
      data: dto,
    });

    return {
      status: 200,
      message: 'Kategori berhasil diupdate',
      data: kategori,
    };
  }
}
