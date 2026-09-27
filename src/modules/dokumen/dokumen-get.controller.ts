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
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';

@ApiTags('Dokumen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dokumen')
export class DokumenGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar dokumen (paginasi)' })
  async findAll(@Query() q: PaginateQuery) {
    const { query, limit, page } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [{ nama: { contains: query, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      this.prisma.dokumen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pengadaan: { select: { id: true, nomorSurat: true, judul: true } },
          diunggahOlehUser: { select: { id: true, nama: true } },
        },
      }),
      this.prisma.dokumen.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data dokumen',
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
  @ApiOperation({ summary: 'Ambil detail dokumen' })
  @ApiParam({ name: 'id', description: 'UUID Dokumen' })
  async findOne(@Param('id') id: string) {
    const dokumen = await this.prisma.dokumen.findUnique({
      where: { id },
      include: {
        pengadaan: true,
        diunggahOlehUser: { select: { id: true, nama: true, email: true } },
      },
    });
    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return {
      status: 200,
      message: 'Berhasil mengambil detail dokumen',
      data: dokumen,
    };
  }

  @Get('by-pengadaan/:pengadaanId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil dokumen berdasarkan pengadaan' })
  @ApiParam({ name: 'pengadaanId' })
  async findByPengadaan(@Param('pengadaanId') pengadaanId: string) {
    const data = await this.prisma.dokumen.findMany({
      where: { pengadaanId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 200,
      message: 'Berhasil mengambil dokumen pengadaan',
      data,
    };
  }
}
