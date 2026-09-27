import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { AuditLogGetController } from './auditlog-get.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [AuditLogGetController],
})
export class AuditLogModule {}
