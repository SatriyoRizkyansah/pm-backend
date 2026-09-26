import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
