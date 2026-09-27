import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { NotifikasiGetController } from './notifikasi-get.controller.js';
import { NotifikasiPutController } from './notifikasi-put.controller.js';
import { NotifikasiService } from './notifikasi.service.js';

@Module({
  imports: [AuthModule],
  controllers: [NotifikasiGetController, NotifikasiPutController],
  providers: [NotifikasiService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}
