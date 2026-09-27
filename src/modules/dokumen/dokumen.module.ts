import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { DokumenGetController } from './dokumen-get.controller.js';
import { DokumenPostController } from './dokumen-post.controller.js';
import { DokumenDeleteController } from './dokumen-delete.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    DokumenGetController,
    DokumenPostController,
    DokumenDeleteController,
  ],
})
export class DokumenModule {}
