-- CreateEnum
CREATE TYPE "StatusUmum" AS ENUM ('aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "StatusDokumen" AS ENUM ('lengkap', 'belum_lengkap', 'kedaluwarsa');

-- CreateEnum
CREATE TYPE "StatusPengadaan" AS ENUM ('draft', 'diajukan', 'dalam_review', 'disetujui', 'ditolak', 'revisi', 'sedang_proses', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "MetodePengadaan" AS ENUM ('tender', 'pengadaan_langsung', 'penunjukan_langsung', 'e_procurement');

-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('menunggu', 'disetujui', 'ditolak', 'revisi');

-- CreateEnum
CREATE TYPE "TipePenyimpanan" AS ENUM ('upload_lokal', 'link_eksternal');

-- CreateEnum
CREATE TYPE "PrioritasPengadaan" AS ENUM ('rendah', 'sedang', 'tinggi', 'darurat');

-- CreateEnum
CREATE TYPE "StatusBarang" AS ENUM ('dipesan', 'diterima', 'ditolak', 'dikembalikan');

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HakAkses" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "modul" VARCHAR(50) NOT NULL,
    "dapatBaca" BOOLEAN NOT NULL DEFAULT false,
    "dapatTulis" BOOLEAN NOT NULL DEFAULT false,
    "dapatApprove" BOOLEAN NOT NULL DEFAULT false,
    "dapatHapus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HakAkses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "roleId" UUID NOT NULL,
    "unitKerja" VARCHAR(150),
    "foto" VARCHAR(500),
    "status" "StatusUmum" NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "email" VARCHAR(150),
    "npwp" VARCHAR(30),
    "contactPerson" VARCHAR(150),
    "status" "StatusUmum" NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriPengadaan" (
    "id" UUID NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,

    CONSTRAINT "KategoriPengadaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "spesifikasi" TEXT,
    "satuan" VARCHAR(50) NOT NULL,
    "kategoriId" UUID NOT NULL,
    "hargaEstimasi" DECIMAL(20,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengadaan" (
    "id" UUID NOT NULL,
    "nomorSurat" VARCHAR(50) NOT NULL,
    "judul" VARCHAR(300) NOT NULL,
    "deskripsi" TEXT,
    "metode" "MetodePengadaan" NOT NULL,
    "prioritas" "PrioritasPengadaan" NOT NULL DEFAULT 'sedang',
    "status" "StatusPengadaan" NOT NULL DEFAULT 'draft',
    "tanggalPengajuan" DATE,
    "tanggalDeadline" DATE,
    "totalEstimasi" DECIMAL(20,2),
    "unitKerja" VARCHAR(150),
    "diajukanOleh" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengadaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengadaanItem" (
    "id" UUID NOT NULL,
    "pengadaanId" UUID NOT NULL,
    "barangId" UUID NOT NULL,
    "vendorId" UUID,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" DECIMAL(20,2),
    "subtotal" DECIMAL(20,2),
    "status" "StatusBarang" NOT NULL DEFAULT 'dipesan',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengadaanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalWorkflow" (
    "id" UUID NOT NULL,
    "pengadaanId" UUID NOT NULL,
    "urutan" INTEGER NOT NULL,
    "namaLangkah" VARCHAR(150) NOT NULL,
    "penanggungJawab" UUID,
    "status" "StatusApproval" NOT NULL DEFAULT 'menunggu',
    "tanggalKeputusan" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokumen" (
    "id" UUID NOT NULL,
    "pengadaanId" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "tipePenyimpanan" "TipePenyimpanan" NOT NULL DEFAULT 'upload_lokal',
    "filePath" VARCHAR(500) NOT NULL,
    "ukuran" INTEGER,
    "status" "StatusDokumen" NOT NULL DEFAULT 'belum_lengkap',
    "diunggahOleh" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "pengadaanId" UUID,
    "referensiTabel" VARCHAR(50) NOT NULL,
    "referensiId" UUID NOT NULL,
    "pesan" VARCHAR(255) NOT NULL,
    "tanggalKirim" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sudahDibaca" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "tabel" VARCHAR(50) NOT NULL,
    "recordId" UUID NOT NULL,
    "aksi" VARCHAR(20) NOT NULL,
    "dilakukanOleh" UUID,
    "dataSebelum" JSONB,
    "dataSesudah" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_kode_key" ON "Role"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "HakAkses_roleId_modul_key" ON "HakAkses"("roleId", "modul");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriPengadaan_kode_key" ON "KategoriPengadaan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Pengadaan_nomorSurat_key" ON "Pengadaan"("nomorSurat");

-- CreateIndex
CREATE INDEX "Pengadaan_status_idx" ON "Pengadaan"("status");

-- CreateIndex
CREATE INDEX "Pengadaan_tanggalPengajuan_idx" ON "Pengadaan"("tanggalPengajuan");

-- CreateIndex
CREATE INDEX "Pengadaan_diajukanOleh_idx" ON "Pengadaan"("diajukanOleh");

-- CreateIndex
CREATE INDEX "PengadaanItem_pengadaanId_idx" ON "PengadaanItem"("pengadaanId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_pengadaanId_idx" ON "ApprovalWorkflow"("pengadaanId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_status_idx" ON "ApprovalWorkflow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalWorkflow_pengadaanId_urutan_key" ON "ApprovalWorkflow"("pengadaanId", "urutan");

-- CreateIndex
CREATE INDEX "Dokumen_pengadaanId_idx" ON "Dokumen"("pengadaanId");

-- CreateIndex
CREATE INDEX "Notifikasi_userId_sudahDibaca_idx" ON "Notifikasi"("userId", "sudahDibaca");

-- CreateIndex
CREATE INDEX "AuditLog_tabel_recordId_idx" ON "AuditLog"("tabel", "recordId");

-- AddForeignKey
ALTER TABLE "HakAkses" ADD CONSTRAINT "HakAkses_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriPengadaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengadaan" ADD CONSTRAINT "Pengadaan_diajukanOleh_fkey" FOREIGN KEY ("diajukanOleh") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengadaanItem" ADD CONSTRAINT "PengadaanItem_pengadaanId_fkey" FOREIGN KEY ("pengadaanId") REFERENCES "Pengadaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengadaanItem" ADD CONSTRAINT "PengadaanItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengadaanItem" ADD CONSTRAINT "PengadaanItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_pengadaanId_fkey" FOREIGN KEY ("pengadaanId") REFERENCES "Pengadaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_penanggungJawab_fkey" FOREIGN KEY ("penanggungJawab") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_pengadaanId_fkey" FOREIGN KEY ("pengadaanId") REFERENCES "Pengadaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_diunggahOleh_fkey" FOREIGN KEY ("diunggahOleh") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_pengadaanId_fkey" FOREIGN KEY ("pengadaanId") REFERENCES "Pengadaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_dilakukanOleh_fkey" FOREIGN KEY ("dilakukanOleh") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
