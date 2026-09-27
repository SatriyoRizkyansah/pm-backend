import {
  Controller,
  Post,
  Body,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { CreateBarangDto } from './barang.dto.js';

@ApiTags('Barang')
@Controller('api/barang')
export class BarangPostController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiRoles('Tambah barang baru', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateBarangDto) {
    // Validate kategori exists
    const kategori = await this.prisma.kategoriPengadaan.findUnique({
      where: { id: dto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('Kategori pengadaan tidak ditemukan');
    }

    const barang = await this.prisma.barang.create({
      data: {
        nama: dto.nama,
        spesifikasi: dto.spesifikasi,
        satuan: dto.satuan,
        kategoriId: dto.kategoriId,
        hargaEstimasi: dto.hargaEstimasi,
      },
      include: { kategori: { select: { id: true, kode: true, nama: true } } },
    });

    return {
      status: 201,
      message: 'Barang berhasil ditambahkan',
      data: barang,
    };
  }
}
