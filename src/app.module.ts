import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health.controller.js';
import { VendorModule } from './modules/vendor/vendor.module.js';
import { KategoriModule } from './modules/kategori/kategori.module.js';
import { BarangModule } from './modules/barang/barang.module.js';
import { PengadaanModule } from './modules/pengadaan/pengadaan.module.js';
import { ApprovalModule } from './modules/approval/approval.module.js';
import { DokumenModule } from './modules/dokumen/dokumen.module.js';
import { UserModule } from './modules/user/user.module.js';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module.js';
import { AuditLogModule } from './modules/auditlog/auditlog.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    VendorModule,
    KategoriModule,
    BarangModule,
    PengadaanModule,
    ApprovalModule,
    DokumenModule,
    UserModule,
    NotifikasiModule,
    AuditLogModule,
    DashboardModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
