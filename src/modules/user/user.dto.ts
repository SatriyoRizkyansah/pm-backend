import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { EmptyToUndefined } from '../../common/utils/empty-to-undefined.js';
import { StatusUmum } from '@prisma/client';

// ─── QUERY ────────────────────────────────────────────────────────────────

export class UserQueryDto extends PaginateQuery {
  @ApiPropertyOptional({ enum: StatusUmum })
  @IsOptional()
  @IsEnum(StatusUmum)
  status?: StatusUmum;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsOptional()
  @IsUUID()
  roleId?: string;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export class CreateUserDto {
  @ApiProperty({ description: 'Nama lengkap' })
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  @MaxLength(150)
  nama: string;

  @ApiProperty({ description: 'Email (unik)' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({ description: 'Password minimal 6 karakter' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({ description: 'UUID Role' })
  @IsNotEmpty({ message: 'Role wajib dipilih' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ description: 'Unit kerja' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  unitKerja?: string;

  @ApiPropertyOptional({ enum: StatusUmum, default: StatusUmum.aktif })
  @IsOptional()
  @IsEnum(StatusUmum)
  status?: StatusUmum;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nama lengkap' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @EmptyToUndefined()
  nama?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  @EmptyToUndefined()
  email?: string;

  @ApiPropertyOptional({ description: 'Password baru' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @EmptyToUndefined()
  password?: string;

  @ApiPropertyOptional({ description: 'UUID Role' })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Unit kerja' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @EmptyToUndefined()
  unitKerja?: string;

  @ApiPropertyOptional({ enum: StatusUmum })
  @IsOptional()
  @IsEnum(StatusUmum)
  status?: StatusUmum;
}
