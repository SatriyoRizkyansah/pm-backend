import { Controller, Get, Param, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';

@ApiTags('Approval')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/approval')
export class ApprovalGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Daftar pengadaan yang perlu di-approve' })
  async findAll(@Query() q: PaginateQuery, @CurrentUser() user: JwtPayload) {
    const { query, limit, page } = q;
    const skip = (page - 1) * limit;

    const where: any = {
      approvalSteps: {
        some: {
          status: 'menunggu',
          penanggungJawab: null, // Not yet assigned → anyone with approve role
        },
      },
    };

    if (query) {
      where.OR = [
        { judul: { contains: query, mode: 'insensitive' } },
        { nomorSurat: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.pengadaan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          diajukanOlehUser: { select: { id: true, nama: true, email: true } },
          approvalSteps: { orderBy: { urutan: 'asc' } },
          items: {
            include: { barang: { select: { id: true, nama: true } } },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.pengadaan.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil daftar approval',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Get('my')
  @HttpCode(200)
  @ApiOperation({ summary: 'Daftar pengadaan yang saya ajukan' })
  async findMyPengadaan(
    @Query() q: PaginateQuery,
    @CurrentUser() user: JwtPayload,
  ) {
    const { query, limit, page } = q;
    const skip = (page - 1) * limit;

    const where: any = { diajukanOleh: user.sub };
    if (query) {
      where.OR = [
        { judul: { contains: query, mode: 'insensitive' } },
        { nomorSurat: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.pengadaan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          approvalSteps: { orderBy: { urutan: 'asc' } },
          _count: { select: { items: true, dokumen: true } },
        },
      }),
      this.prisma.pengadaan.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil pengadaan saya',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Get('history/:pengadaanId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Riwayat approval pengadaan' })
  @ApiParam({ name: 'pengadaanId' })
  async getHistory(@Param('pengadaanId') pengadaanId: string) {
    const steps = await this.prisma.approvalWorkflow.findMany({
      where: { pengadaanId },
      orderBy: { urutan: 'asc' },
      include: {
        penanggungJawabUser: {
          select: { id: true, nama: true, email: true },
        },
      },
    });

    return {
      status: 200,
      message: 'Berhasil mengambil riwayat approval',
      data: steps,
    };
  }
}
