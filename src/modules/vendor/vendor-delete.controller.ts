import {
  Controller,
  Delete,
  Param,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';

@ApiTags('Vendor')
@Controller('api/vendor')
export class VendorDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus vendor', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Vendor' })
  async remove(@Param('id') id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: { pengadaanItems: true },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor tidak ditemukan');
    }

    if (vendor.pengadaanItems.length > 0) {
      throw new BadRequestException(
        'Vendor tidak dapat dihapus karena masih terkait dengan data pengadaan',
      );
    }

    await this.prisma.vendor.delete({ where: { id } });

    return {
      status: 200,
      message: 'Vendor berhasil dihapus',
      data: null,
    };
  }
}
