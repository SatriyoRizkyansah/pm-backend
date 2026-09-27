import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { PengadaanGetController } from './pengadaan-get.controller.js';
import { PengadaanPostController } from './pengadaan-post.controller.js';
import { PengadaanPutController } from './pengadaan-put.controller.js';
import { PengadaanDeleteController } from './pengadaan-delete.controller.js';
import { PengadaanService } from './pengadaan.service.js';

@Module({
  imports: [AuthModule],
  controllers: [
    PengadaanGetController,
    PengadaanPostController,
    PengadaanPutController,
    PengadaanDeleteController,
  ],
  providers: [PengadaanService],
  exports: [PengadaanService],
})
export class PengadaanModule {}
