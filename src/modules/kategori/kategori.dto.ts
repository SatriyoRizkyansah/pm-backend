import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { EmptyToUndefined } from '../../common/utils/empty-to-undefined.js';

// ─── QUERY ────────────────────────────────────────────────────────────────

export class KategoriQueryDto extends PaginateQuery {}

// ─── CREATE ───────────────────────────────────────────────────────────────

export class CreateKategoriDto {
  @ApiProperty({ description: 'Kode kategori (unik)', example: 'OIL' })
  @IsNotEmpty({ message: 'Kode kategori wajib diisi' })
  @IsString()
  @MaxLength(20)
  kode: string;

  @ApiProperty({ description: 'Nama kategori' })
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @IsString()
  @MaxLength(100)
  nama: string;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export class UpdateKategoriDto {
  @ApiPropertyOptional({ description: 'Kode kategori (unik)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @EmptyToUndefined()
  kode?: string;

  @ApiPropertyOptional({ description: 'Nama kategori' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @EmptyToUndefined()
  nama?: string;
}
