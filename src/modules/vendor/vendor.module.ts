import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { VendorGetController } from './vendor-get.controller.js';
import { VendorPostController } from './vendor-post.controller.js';
import { VendorPutController } from './vendor-put.controller.js';
import { VendorDeleteController } from './vendor-delete.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    VendorGetController,
    VendorPostController,
    VendorPutController,
    VendorDeleteController,
  ],
})
export class VendorModule {}
