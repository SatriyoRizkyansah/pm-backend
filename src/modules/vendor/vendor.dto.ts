import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { EmptyToUndefined } from '../../common/utils/empty-to-undefined.js';
import { StatusUmum } from '@prisma/client';

// ─── QUERY ────────────────────────────────────────────────────────────────

export class VendorQueryDto extends PaginateQuery {
  @ApiPropertyOptional({ description: 'Filter status vendor' })
  @IsOptional()
  @IsEnum(StatusUmum, { message: 'Status harus aktif atau nonaktif' })
  status?: StatusUmum;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export class CreateVendorDto {
  @ApiProperty({ description: 'Nama vendor / perusahaan' })
  @IsNotEmpty({ message: 'Nama vendor wajib diisi' })
  @IsString()
  @MaxLength(200)
  nama: string;

  @ApiPropertyOptional({ description: 'Alamat lengkap' })
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional({ description: 'Nomor telepon' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telepon?: string;

  @ApiPropertyOptional({ description: 'Email vendor' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({ description: 'NPWP' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  npwp?: string;

  @ApiPropertyOptional({ description: 'Nama contact person' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactPerson?: string;

  @ApiPropertyOptional({ enum: StatusUmum, default: StatusUmum.aktif })
  @IsOptional()
  @IsEnum(StatusUmum)
  status?: StatusUmum;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export class UpdateVendorDto {
  @ApiPropertyOptional({ description: 'Nama vendor / perusahaan' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @EmptyToUndefined()
  nama?: string;

  @ApiPropertyOptional({ description: 'Alamat lengkap' })
  @IsOptional()
  @IsString()
  @EmptyToUndefined()
  alamat?: string;

  @ApiPropertyOptional({ description: 'Nomor telepon' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @EmptyToUndefined()
  telepon?: string;

  @ApiPropertyOptional({ description: 'Email vendor' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  @EmptyToUndefined()
  email?: string;

  @ApiPropertyOptional({ description: 'NPWP' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @EmptyToUndefined()
  npwp?: string;

  @ApiPropertyOptional({ description: 'Nama contact person' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @EmptyToUndefined()
  contactPerson?: string;

  @ApiPropertyOptional({ enum: StatusUmum })
  @IsOptional()
  @IsEnum(StatusUmum)
  status?: StatusUmum;
}
