import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { PengadaanQueryDto } from './pengadaan.dto.js';

@ApiTags('Pengadaan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/pengadaan')
export class PengadaanGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar pengadaan (paginasi + filter)' })
  async findAll(
    @Query() q: PengadaanQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const { query, limit, page, status, metode, prioritas } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (metode) where.metode = metode;
    if (prioritas) where.prioritas = prioritas;
    if (query) {
      where.OR = [
        { judul: { contains: query, mode: 'insensitive' } },
        { nomorSurat: { contains: query, mode: 'insensitive' } },
        { deskripsi: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.pengadaan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          diajukanOlehUser: {
            select: { id: true, nama: true, email: true },
          },
          items: {
            include: {
              barang: { select: { id: true, nama: true, satuan: true } },
              vendor: { select: { id: true, nama: true } },
            },
          },
          _count: {
            select: { items: true, dokumen: true, approvalSteps: true },
          },
        },
      }),
      this.prisma.pengadaan.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data pengadaan',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil detail pengadaan' })
  @ApiParam({ name: 'id', description: 'UUID Pengadaan' })
  async findOne(@Param('id') id: string) {
    const pengadaan = await this.prisma.pengadaan.findUnique({
      where: { id },
      include: {
        diajukanOlehUser: {
          select: { id: true, nama: true, email: true, unitKerja: true },
        },
        items: {
          include: {
            barang: true,
            vendor: true,
          },
        },
        dokumen: true,
        approvalSteps: {
          orderBy: { urutan: 'asc' },
          include: {
            penanggungJawabUser: {
              select: { id: true, nama: true, email: true },
            },
          },
        },
        notifikasi: {
          orderBy: { tanggalKirim: 'desc' },
          take: 10,
        },
      },
    });

    if (!pengadaan) {
      throw new NotFoundException('Pengadaan tidak ditemukan');
    }

    return {
      status: 200,
      message: 'Berhasil mengambil detail pengadaan',
      data: pengadaan,
    };
  }
}
