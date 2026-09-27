import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { EmptyToUndefined } from '../../common/utils/empty-to-undefined.js';

// ─── QUERY ────────────────────────────────────────────────────────────────

export class BarangQueryDto extends PaginateQuery {
  @ApiPropertyOptional({ description: 'Filter by kategori ID' })
  @IsOptional()
  @IsUUID()
  kategoriId?: string;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export class CreateBarangDto {
  @ApiProperty({ description: 'Nama barang' })
  @IsNotEmpty({ message: 'Nama barang wajib diisi' })
  @IsString()
  @MaxLength(200)
  nama: string;

  @ApiPropertyOptional({ description: 'Spesifikasi barang' })
  @IsOptional()
  @IsString()
  spesifikasi?: string;

  @ApiProperty({ description: 'Satuan (pcs, kg, liter, dll)', example: 'kg' })
  @IsNotEmpty({ message: 'Satuan wajib diisi' })
  @IsString()
  @MaxLength(50)
  satuan: string;

  @ApiProperty({ description: 'UUID Kategori Pengadaan' })
  @IsNotEmpty({ message: 'Kategori wajib dipilih' })
  @IsUUID()
  kategoriId: string;

  @ApiPropertyOptional({ description: 'Harga estimasi per satuan' })
  @IsOptional()
  @IsNumber({}, { message: 'Harga estimasi harus berupa angka' })
  @Min(0, { message: 'Harga estimasi tidak boleh negatif' })
  @Type(() => Number)
  hargaEstimasi?: number;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export class UpdateBarangDto {
  @ApiPropertyOptional({ description: 'Nama barang' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @EmptyToUndefined()
  nama?: string;

  @ApiPropertyOptional({ description: 'Spesifikasi barang' })
  @IsOptional()
  @IsString()
  @EmptyToUndefined()
  spesifikasi?: string;

  @ApiPropertyOptional({ description: 'Satuan' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @EmptyToUndefined()
  satuan?: string;

  @ApiPropertyOptional({ description: 'UUID Kategori Pengadaan' })
  @IsOptional()
  @IsUUID()
  kategoriId?: string;

  @ApiPropertyOptional({ description: 'Harga estimasi per satuan' })
  @IsOptional()
  @IsNumber({}, { message: 'Harga estimasi harus berupa angka' })
  @Min(0, { message: 'Harga estimasi tidak boleh negatif' })
  @Type(() => Number)
  hargaEstimasi?: number;
}
