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
import { UserQueryDto } from './user.dto.js';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user')
export class UserGetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar user (paginasi)' })
  async findAll(@Query() q: UserQueryDto) {
    const { query, limit, page, status, roleId } = q;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (roleId) where.roleId = roleId;
    if (query) {
      where.OR = [
        { nama: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { unitKerja: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nama: true,
          email: true,
          unitKerja: true,
          foto: true,
          status: true,
          createdAt: true,
          role: { select: { id: true, kode: true, nama: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      status: 200,
      message: 'Berhasil mengambil data user',
      data,
      pagination: {
        page,
        limit,
        total_datas: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Get('roles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil daftar role' })
  async getRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { kode: 'asc' },
      include: { _count: { select: { users: true } } },
    });

    return {
      status: 200,
      message: 'Berhasil mengambil data role',
      data: roles,
    };
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ambil detail user' })
  @ApiParam({ name: 'id', description: 'UUID User' })
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        email: true,
        unitKerja: true,
        foto: true,
        status: true,
        createdAt: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      status: 200,
      message: 'Berhasil mengambil detail user',
      data: user,
    };
  }
}
