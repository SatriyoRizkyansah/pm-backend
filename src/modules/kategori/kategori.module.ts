import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { KategoriGetController } from './kategori-get.controller.js';
import { KategoriPostController } from './kategori-post.controller.js';
import { KategoriPutController } from './kategori-put.controller.js';
import { KategoriDeleteController } from './kategori-delete.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    KategoriGetController,
    KategoriPostController,
    KategoriPutController,
    KategoriDeleteController,
  ],
})
export class KategoriModule {}
