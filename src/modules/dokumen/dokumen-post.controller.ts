import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { PrismaService } from '../../prisma.module.js';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipePenyimpanan } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

class UploadDokumenDto {
  @ApiProperty({ description: 'UUID Pengadaan' })
  @IsNotEmpty()
  @IsUUID()
  pengadaanId!: string;

  @ApiProperty({ description: 'Nama dokumen' })
  @IsNotEmpty()
  @IsString()
  nama!: string;

  @ApiPropertyOptional({ enum: TipePenyimpanan })
  @IsOptional()
  @IsEnum(TipePenyimpanan)
  tipePenyimpanan?: TipePenyimpanan;
}

@ApiTags('Dokumen')
@Controller('api/dokumen')
export class DokumenPostController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('upload')
  @HttpCode(201)
  @ApiRoles('Upload dokumen', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/dokumen',
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pengadaanId: { type: 'string' },
        nama: { type: 'string' },
        tipePenyimpanan: {
          type: 'string',
          enum: ['upload_lokal', 'link_eksternal'],
        },
      },
    },
  })
  async upload(
    @UploadedFile() file: any,
    @Body() body: UploadDokumenDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('File wajib diupload');
    }

    // Validate pengadaan exists
    const pengadaan = await this.prisma.pengadaan.findUnique({
      where: { id: body.pengadaanId },
    });
    if (!pengadaan) {
      // Cleanup uploaded file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new NotFoundException('Pengadaan tidak ditemukan');
    }

    const dokumen = await this.prisma.dokumen.create({
      data: {
        pengadaanId: body.pengadaanId,
        nama: body.nama,
        tipePenyimpanan: body.tipePenyimpanan ?? 'upload_lokal',
        filePath: file.path,
        ukuran: file.size,
        status: 'belum_lengkap',
        diunggahOleh: user.sub,
      },
      include: {
        pengadaan: { select: { id: true, nomorSurat: true, judul: true } },
      },
    });

    return {
      status: 201,
      message: 'Dokumen berhasil diupload',
      data: dokumen,
    };
  }
}
