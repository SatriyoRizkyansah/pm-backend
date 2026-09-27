import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';
import { EmptyToUndefined } from '../../common/utils/empty-to-undefined.js';
import {
  MetodePengadaan,
  StatusPengadaan,
  PrioritasPengadaan,
} from '@prisma/client';

// ─── ITEM DTO ─────────────────────────────────────────────────────────────

export class PengadaanItemDto {
  @ApiProperty({ description: 'UUID Barang' })
  @IsNotEmpty({ message: 'Barang wajib dipilih' })
  @IsUUID()
  barangId: string;

  @ApiPropertyOptional({ description: 'UUID Vendor' })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({ description: 'Jumlah / quantity' })
  @IsNotEmpty({ message: 'Jumlah wajib diisi' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Jumlah harus angka bulat' })
  @Min(1, { message: 'Jumlah minimal 1' })
  @Type(() => Number)
  jumlah: number;

  @ApiPropertyOptional({ description: 'Harga satuan' })
  @IsOptional()
  @IsNumber({}, { message: 'Harga satuan harus berupa angka' })
  @Min(0)
  @Type(() => Number)
  hargaSatuan?: number;

  @ApiPropertyOptional({ description: 'Catatan item' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

// ─── QUERY ────────────────────────────────────────────────────────────────

export class PengadaanQueryDto extends PaginateQuery {
  @ApiPropertyOptional({ enum: StatusPengadaan })
  @IsOptional()
  @IsEnum(StatusPengadaan)
  status?: StatusPengadaan;

  @ApiPropertyOptional({ enum: MetodePengadaan })
  @IsOptional()
  @IsEnum(MetodePengadaan)
  metode?: MetodePengadaan;

  @ApiPropertyOptional({ enum: PrioritasPengadaan })
  @IsOptional()
  @IsEnum(PrioritasPengadaan)
  prioritas?: PrioritasPengadaan;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export class CreatePengadaanDto {
  @ApiProperty({ description: 'Judul pengadaan' })
  @IsNotEmpty({ message: 'Judul pengadaan wajib diisi' })
  @IsString()
  @MaxLength(300)
  judul: string;

  @ApiPropertyOptional({ description: 'Deskripsi pengadaan' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ enum: MetodePengadaan, description: 'Metode pengadaan' })
  @IsNotEmpty({ message: 'Metode pengadaan wajib dipilih' })
  @IsEnum(MetodePengadaan, { message: 'Metode pengadaan tidak valid' })
  metode: MetodePengadaan;

  @ApiPropertyOptional({
    enum: PrioritasPengadaan,
    default: PrioritasPengadaan.sedang,
  })
  @IsOptional()
  @IsEnum(PrioritasPengadaan)
  prioritas?: PrioritasPengadaan;

  @ApiPropertyOptional({ description: 'Tanggal pengajuan (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  tanggalPengajuan?: string;

  @ApiPropertyOptional({ description: 'Tanggal deadline (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  tanggalDeadline?: string;

  @ApiPropertyOptional({ description: 'Unit kerja' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  unitKerja?: string;

  @ApiProperty({ type: [PengadaanItemDto], description: 'Item barang' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PengadaanItemDto)
  items: PengadaanItemDto[];
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export class UpdatePengadaanDto {
  @ApiPropertyOptional({ description: 'Judul pengadaan' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @EmptyToUndefined()
  judul?: string;

  @ApiPropertyOptional({ description: 'Deskripsi pengadaan' })
  @IsOptional()
  @IsString()
  @EmptyToUndefined()
  deskripsi?: string;

  @ApiPropertyOptional({ enum: MetodePengadaan })
  @IsOptional()
  @IsEnum(MetodePengadaan)
  metode?: MetodePengadaan;

  @ApiPropertyOptional({ enum: PrioritasPengadaan })
  @IsOptional()
  @IsEnum(PrioritasPengadaan)
  prioritas?: PrioritasPengadaan;

  @ApiPropertyOptional({ enum: StatusPengadaan })
  @IsOptional()
  @IsEnum(StatusPengadaan)
  status?: StatusPengadaan;

  @ApiPropertyOptional({ description: 'Tanggal pengajuan (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  @EmptyToUndefined()
  tanggalPengajuan?: string;

  @ApiPropertyOptional({ description: 'Tanggal deadline (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  @EmptyToUndefined()
  tanggalDeadline?: string;

  @ApiPropertyOptional({ description: 'Unit kerja' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @EmptyToUndefined()
  unitKerja?: string;

  @ApiPropertyOptional({
    type: [PengadaanItemDto],
    description: 'Item barang (replace)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PengadaanItemDto)
  items?: PengadaanItemDto[];
}
