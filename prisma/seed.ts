import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { kode: 'ADMIN' },
    update: {},
    create: {
      kode: 'ADMIN',
      nama: 'Administrator',
      deskripsi: 'Akses penuh ke seluruh sistem',
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { kode: 'OPERATOR' },
    update: {},
    create: {
      kode: 'OPERATOR',
      nama: 'Operator',
      deskripsi: 'Operator pengadaan',
    },
  });

  const verifikatorRole = await prisma.role.upsert({
    where: { kode: 'VERIFIKATOR' },
    update: {},
    create: {
      kode: 'VERIFIKATOR',
      nama: 'Verifikator',
      deskripsi: 'Verifikasi pengadaan',
    },
  });

  const pimpinanRole = await prisma.role.upsert({
    where: { kode: 'PIMPINAN' },
    update: {},
    create: {
      kode: 'PIMPINAN',
      nama: 'Pimpinan',
      deskripsi: 'Pimpinan yang menyetujui pengadaan',
    },
  });

  console.log('✅ Roles created');

  // 2. Hak Akses
  const modules = [
    'pengadaan',
    'vendor',
    'barang',
    'dokumen',
    'laporan',
    'user',
    'pengaturan',
  ];

  for (const modul of modules) {
    await prisma.hakAkses.upsert({
      where: { roleId_modul: { roleId: adminRole.id, modul } },
      update: {},
      create: {
        roleId: adminRole.id,
        modul,
        dapatBaca: true,
        dapatTulis: true,
        dapatApprove: true,
        dapatHapus: true,
      },
    });

    await prisma.hakAkses.upsert({
      where: { roleId_modul: { roleId: operatorRole.id, modul } },
      update: {},
      create: {
        roleId: operatorRole.id,
        modul,
        dapatBaca: true,
        dapatTulis: true,
        dapatApprove: false,
        dapatHapus: false,
      },
    });
  }

  console.log('✅ Hak Akses created');

  // 3. Admin User (password: devByPass — matches PASSWORD_BYPASS in .env)
  const passwordHash = await hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@lemigas.esdm.go.id' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@lemigas.esdm.go.id',
      passwordHash,
      roleId: adminRole.id,
      unitKerja: 'LEMIGAS',
      status: 'aktif',
    },
  });

  console.log('✅ Admin user created');

  // 4. Kategori Pengadaan
  const kategoriData = [
    { kode: 'OIL', nama: 'Minyak Mentah & Produk Minyak' },
    { kode: 'EQUIP', nama: 'Peralatan & Mesin' },
    { kode: 'CHEM', nama: 'Bahan Kimia' },
    { kode: 'CONSUM', nama: 'Barang Habis Pakai' },
    { kode: 'SERVICE', nama: 'Jasa' },
  ];

  for (const k of kategoriData) {
    await prisma.kategoriPengadaan.upsert({
      where: { kode: k.kode },
      update: {},
      create: k,
    });
  }

  console.log('✅ Kategori Pengadaan created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
