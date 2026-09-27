import {
  Controller,
  Delete,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { PrismaService } from '../../prisma.module.js';
import * as fs from 'fs';

@ApiTags('Dokumen')
@Controller('api/dokumen')
export class DokumenDeleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete(':id')
  @HttpCode(200)
  @ApiRoles('Hapus dokumen', [Role.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', description: 'UUID Dokumen' })
  async remove(@Param('id') id: string) {
    const dokumen = await this.prisma.dokumen.findUnique({ where: { id } });
    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    // Delete file from disk if exists
    if (dokumen.tipePenyimpanan === 'upload_lokal' && dokumen.filePath) {
      if (fs.existsSync(dokumen.filePath)) {
        fs.unlinkSync(dokumen.filePath);
      }
    }

    await this.prisma.dokumen.delete({ where: { id } });

    return {
      status: 200,
      message: 'Dokumen berhasil dihapus',
      data: null,
    };
  }
}
