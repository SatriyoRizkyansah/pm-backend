import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { BarangGetController } from './barang-get.controller.js';
import { BarangPostController } from './barang-post.controller.js';
import { BarangPutController } from './barang-put.controller.js';
import { BarangDeleteController } from './barang-delete.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    BarangGetController,
    BarangPostController,
    BarangPutController,
    BarangDeleteController,
  ],
})
export class BarangModule {}
