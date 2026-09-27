import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { ApprovalGetController } from './approval-get.controller.js';
import { ApprovalActionController } from './approval-action.controller.js';
import { ApprovalService } from './approval.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ApprovalGetController, ApprovalActionController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
