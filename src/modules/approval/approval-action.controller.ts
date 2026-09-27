import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ApiRoles } from '../../common/decorators/api-roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { CurrentUser } from '../../auth/user.decorator.js';
import type { JwtPayload } from '../../auth/user.decorator.js';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalService } from './approval.service.js';

class SubmitApprovalDto {
  @ApiProperty({ description: 'UUID Pengadaan yang akan diajukan' })
  @IsUUID()
  pengadaanId!: string;
}

class DecisionDto {
  @ApiProperty({
    enum: ['disetujui', 'ditolak'],
    description: 'Keputusan approval',
  })
  @IsEnum(['disetujui', 'ditolak'] as const)
  decision!: 'disetujui' | 'ditolak';

  @ApiPropertyOptional({ description: 'Catatan keputusan' })
  @IsOptional()
  @IsString()
  catatan?: string;
}

@ApiTags('Approval')
@Controller('api/approval')
export class ApprovalActionController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('submit/:pengadaanId')
  @HttpCode(200)
  @ApiRoles('Ajukan pengadaan untuk approval', [Role.Admin, Role.Operator])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'pengadaanId' })
  async submit(
    @Param('pengadaanId') pengadaanId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      await this.approvalService.submitForApproval(pengadaanId, user.sub);
      return {
        status: 200,
        message: 'Pengadaan berhasil diajukan untuk approval',
        data: null,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('decide/:pengadaanId/:stepId')
  @HttpCode(200)
  @ApiRoles('Proses keputusan approval', [
    Role.Admin,
    Role.Verifikator,
    Role.Pimpinan,
  ])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'pengadaanId' })
  @ApiParam({ name: 'stepId' })
  async decide(
    @Param('pengadaanId') pengadaanId: string,
    @Param('stepId') stepId: string,
    @Body() dto: DecisionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const result = await this.approvalService.processDecision(
        pengadaanId,
        stepId,
        dto.decision,
        dto.catatan,
        user.sub,
      );
      return {
        status: 200,
        message: `Approval ${dto.decision}`,
        data: result,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
