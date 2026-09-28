import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginateQuery } from '../../common/dto/paginate-query.dto.js';

export class AuditLogQueryDto extends PaginateQuery {
  @ApiPropertyOptional({ description: 'Filter berdasarkan tabel' })
  @IsOptional()
  @IsString()
  tabel?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID record' })
  @IsOptional()
  @IsString()
  recordId?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan aksi (CREATE, UPDATE, DELETE)' })
  @IsOptional()
  @IsString()
  aksi?: string;
}
