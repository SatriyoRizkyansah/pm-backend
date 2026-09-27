import {
  Controller,
  Post,
  Body,
  HttpCode,
  ConflictException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { CreateKategoriDto } from './kategori.dto.js';

@ApiTags('Kategori Pengadaan')
@Controller('api/kategori')
export class KategoriPostController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiRoles('Tambah kategori baru', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateKategoriDto) {
    const existing = await this.prisma.kategoriPengadaan.findFirst({
      where: { kode: dto.kode },
    });
    if (existing) {
      throw new ConflictException('Kode kategori sudah digunakan');
    }

    const kategori = await this.prisma.kategoriPengadaan.create({
      data: { kode: dto.kode, nama: dto.nama },
    });

    return {
      status: 201,
      message: 'Kategori berhasil ditambahkan',
      data: kategori,
    };
  }
}
