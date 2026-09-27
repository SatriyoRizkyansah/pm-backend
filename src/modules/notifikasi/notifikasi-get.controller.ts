import { Controller, Get, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';

@ApiTags('Notifikasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notifikasi')
export class NotifikasiGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar notifikasi user' })
  async findAll(@Query() q: PaginateQuery, @CurrentUser() user: JwtPayload) {
    const { limit, page } = q;
    const skip = (page - 1) * limit;

    const where = { userId: user.sub };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notifikasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalKirim: 'desc' },
        include: {
          pengadaan: {
            select: { id: true, nomorSurat: true, judul: true },
          },
        },
      }),
      this.prisma.notifikasi.count({ where }),
      this.prisma.notifikasi.count({
        where: { ...where, sudahDibaca: false },
      }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data notifikasi',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
      unread_count: unreadCount,
    };
  }
}
