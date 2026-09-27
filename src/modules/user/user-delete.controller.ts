import {
  Controller,
  Delete,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';

@ApiTags('User')
@Controller('api/user')
export class UserDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus user', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID User' })
  async remove(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Prevent self-deletion
    // Soft delete by setting status to nonaktif instead
    await this.prisma.user.update({
      where: { id },
      data: { status: 'nonaktif' },
    });

    return {
      status: 200,
      message: 'User berhasil dinonaktifkan',
      data: null,
    };
  }
}
