import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import { UpdateVendorDto } from './vendor.dto.js';

@ApiTags('Vendor')
@Controller('api/vendor')
export class VendorPutController {
  constructor(private readonly prisma: PrismaService) {}

  @Put(':id')
  @HttpCode(200)
  @ApiRoles('Update vendor', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Vendor' })
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vendor tidak ditemukan');
    }

    // Check unique nama if changing
    if (dto.nama && dto.nama !== existing.nama) {
      const duplicate = await this.prisma.vendor.findFirst({
        where: { nama: dto.nama, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Nama vendor sudah digunakan');
      }
    }

    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: dto,
    });

    return {
      status: 200,
      message: 'Vendor berhasil diupdate',
      data: vendor,
    };
  }
}
