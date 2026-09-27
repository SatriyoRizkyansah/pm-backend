import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  HttpCode,
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
import { VendorQueryDto } from './vendor.dto.js';

@ApiTags('Vendor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/vendor')
export class VendorGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar vendor (paginasi + pencarian)' })
  async findAll(@Query() q: VendorQueryDto) {
    const { query, limit, page, status } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { nama: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { contactPerson: { contains: query, mode: 'insensitive' } },
        { npwp: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data vendor',
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
  @ApiOperation({ summary: 'Ambil detail vendor berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'UUID Vendor' })
  async findOne(@Param('id') id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor tidak ditemukan');
    }

    return {
      status: 200,
      message: 'Berhasil mengambil detail vendor',
      data: vendor,
    };
  }
}
