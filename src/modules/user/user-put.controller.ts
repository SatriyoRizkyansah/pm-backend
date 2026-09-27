import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { UpdateUserDto } from './user.dto.js';
import * as bcrypt from 'bcryptjs';

@ApiTags('User')
@Controller('api/user')
export class UserPutController {
  constructor(private readonly prisma: PrismaService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiRoles('Update user', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID User' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check email unique if changing
    if (dto.email && dto.email !== existing.email) {
      const duplicate = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (duplicate) {
        throw new ConflictException('Email sudah digunakan');
      }
    }

    // Check role exists if changing
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException('Role tidak ditemukan');
      }
    }

    const updateData: any = {};
    if (dto.nama !== undefined) updateData.nama = dto.nama;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.unitKerja !== undefined) updateData.unitKerja = dto.unitKerja;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
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
      status: 200,
      message: 'User berhasil diupdate',
      data: user,
    };
  }
}
