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
import { PrismaService } from '../../prisma.module.js';
import { BarangQueryDto } from './barang.dto.js';

@ApiTags('Barang')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/barang')
export class BarangGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar barang (paginasi + filter)' })
  async findAll(@Query() q: BarangQueryDto) {
    const { query, limit, page, kategoriId } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (kategoriId) where.kategoriId = kategoriId;
    if (query) {
      where.OR = [
        { nama: { contains: query, mode: 'insensitive' } },
        { spesifikasi: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { kategori: { select: { id: true, kode: true, nama: true } } },
      }),
      this.prisma.barang.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data barang',
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
  @ApiOperation({ summary: 'Ambil detail barang berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'UUID Barang' })
  async findOne(@Param('id') id: string) {
    const barang = await this.prisma.barang.findUnique({
      where: { id },
      include: { kategori: true },
    });
    if (!barang) {
      throw new NotFoundException('Barang tidak ditemukan');
    }

    return {
      status: 200,
      message: 'Berhasil mengambil detail barang',
      data: barang,
    };
  }
}
