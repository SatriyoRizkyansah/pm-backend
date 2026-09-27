import {
  Controller,
  Post,
  Body,
  HttpCode,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { CreateUserDto } from './user.dto.js';
import * as bcrypt from 'bcryptjs';

@ApiTags('User')
@Controller('api/user')
export class UserPostController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @ApiRoles('Tambah user baru', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateUserDto) {
    // Check email unique
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email sudah digunakan');
    }

    // Check role exists
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nama: dto.nama,
        email: dto.email,
        passwordHash,
        roleId: dto.roleId,
        unitKerja: dto.unitKerja,
        status: dto.status ?? 'aktif',
      },
      select: {
        id: true,
        nama: true,
        email: true,
        unitKerja: true,
        status: true,
        role: { select: { id: true, kode: true, nama: true } },
      },
    });

    return {
      status: 201,
      message: 'User berhasil ditambahkan',
      data: user,
    };
  }
}
