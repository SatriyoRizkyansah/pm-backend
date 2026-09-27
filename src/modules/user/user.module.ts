import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { UserGetController } from './user-get.controller.js';
import { UserPostController } from './user-post.controller.js';
import { UserPutController } from './user-put.controller.js';
import { UserDeleteController } from './user-delete.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    UserGetController,
    UserPostController,
    UserPutController,
    UserDeleteController,
  ],
})
export class UserModule {}
