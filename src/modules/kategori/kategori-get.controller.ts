import { Controller, Get, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { PrismaService } from '../../prisma.module.js';
import { KategoriQueryDto } from './kategori.dto.js';

@ApiTags('Kategori Pengadaan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/kategori')
export class KategoriGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar kategori pengadaan' })
  async findAll(@Query() q: KategoriQueryDto) {
    const { query, limit, page } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { kode: { contains: query, mode: 'insensitive' } },
        { nama: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.kategoriPengadaan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kode: 'asc' },
        include: { _count: { select: { barang: true } } },
      }),
      this.prisma.kategoriPengadaan.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data kategori',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
