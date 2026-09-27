import {
  Controller,
  Put,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';

@ApiTags('Notifikasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notifikasi')
export class NotifikasiPutController {
  constructor(private readonly prisma: PrismaService) {}

  @Put(':id/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Tandai notifikasi sudah dibaca' })
  @ApiParam({ name: 'id', description: 'UUID Notifikasi' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const notifikasi = await this.prisma.notifikasi.findUnique({
      where: { id },
    });
    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }
    if (notifikasi.userId !== user.sub) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    const updated = await this.prisma.notifikasi.update({
      where: { id },
      data: { sudahDibaca: true },
    });

    return {
      status: 200,
      message: 'Notifikasi ditandai sudah dibaca',
      data: updated,
    };
  }

  @Put('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Tandai semua notifikasi sudah dibaca' })
  async markAllAsRead(@CurrentUser() user: JwtPayload) {
    await this.prisma.notifikasi.updateMany({
      where: { userId: user.sub, sudahDibaca: false },
      data: { sudahDibaca: true },
    });

    return {
      status: 200,
      message: 'Semua notifikasi ditandai sudah dibaca',
      data: null,
    };
  }
}
