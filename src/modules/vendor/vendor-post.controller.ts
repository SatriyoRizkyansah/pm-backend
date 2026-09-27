import {
  Controller,
  Post,
  Body,
  HttpCode,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import { CreateVendorDto } from './vendor.dto.js';

@ApiTags('Vendor')
@Controller('api/vendor')
export class VendorPostController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiRoles('Tambah vendor baru', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateVendorDto, @CurrentUser() user: JwtPayload) {
    // Check unique nama
    const existing = await this.prisma.vendor.findFirst({
      where: { nama: dto.nama },
    });
    if (existing) {
      throw new ConflictException('Nama vendor sudah digunakan');
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        nama: dto.nama,
        alamat: dto.alamat,
        telepon: dto.telepon,
        email: dto.email,
        npwp: dto.npwp,
        contactPerson: dto.contactPerson,
        status: dto.status ?? 'aktif',
      },
    });

    return {
      status: 201,
      message: 'Vendor berhasil ditambahkan',
      data: vendor,
    };
  }
}
