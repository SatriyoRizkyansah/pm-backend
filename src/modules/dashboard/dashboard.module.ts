import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { DashboardGetController } from './dashboard-get.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [DashboardGetController],
})
export class DashboardModule {}
