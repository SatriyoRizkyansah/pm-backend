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
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { AuditLogQueryDto } from './auditlog.dto.js';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/audit-log')
export class AuditLogGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiRoles('Ambil daftar audit log', [Role.Admin, Role.Pimpinan])
  @ApiOperation({ summary: 'Ambil daftar audit log (paginasi)' })
  async findAll(@Query() q: AuditLogQueryDto) {
    const limit = Number(q?.limit) > 0 ? Number(q.limit) : 10;
    const page = Number(q?.page) > 0 ? Number(q.page) : 1;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q?.tabel) where.tabel = q.tabel;
    if (q?.recordId) where.recordId = q.recordId;
    if (q?.aksi) where.aksi = { equals: q.aksi, mode: 'insensitive' };
    if (q?.query) {
      where.OR = [
        { tabel: { contains: q.query, mode: 'insensitive' } },
        { aksi: { contains: q.query, mode: 'insensitive' } },
        { recordId: { contains: q.query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          dilakukanOlehUser: { select: { id: true, nama: true, email: true, unitKerja: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data audit log',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Get('by-record/:tabel/:recordId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Audit log untuk record tertentu' })
  @ApiParam({ name: 'tabel' })
  @ApiParam({ name: 'recordId' })
  async findByRecord(
    @Param('tabel') tabel: string,
    @Param('recordId') recordId: string,
  ) {
    const data = await this.prisma.auditLog.findMany({
      where: { tabel, recordId },
      orderBy: { createdAt: 'desc' },
      include: {
        dilakukanOlehUser: { select: { id: true, nama: true, email: true } },
      },
    });

    return {
      status: 200,
      message: 'Berhasil mengambil audit log',
      data,
    };
  }
}
