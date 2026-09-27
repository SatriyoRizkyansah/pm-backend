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

    // Verifikator: read + approve (no write, no delete)
    const verifModules = ['pengadaan', 'vendor', 'barang', 'dokumen'];
    if (verifModules.includes(modul)) {
      await prisma.hakAkses.upsert({
        where: { roleId_modul: { roleId: verifikatorRole.id, modul } },
        update: {},
        create: {
          roleId: verifikatorRole.id,
          modul,
          dapatBaca: true,
          dapatTulis: false,
          dapatApprove: true,
          dapatHapus: false,
        },
      });
    }

    // Pimpinan: read + approve (no write, no delete)
    const pimpinanModules = ['pengadaan', 'dokumen'];
    if (pimpinanModules.includes(modul)) {
      await prisma.hakAkses.upsert({
        where: { roleId_modul: { roleId: pimpinanRole.id, modul } },
        update: {},
        create: {
          roleId: pimpinanRole.id,
          modul,
          dapatBaca: true,
          dapatTulis: false,
          dapatApprove: true,
          dapatHapus: false,
        },
      });
    }
  }

  console.log('✅ Hak Akses created');

  // 3. Users — one per role (password: admin123, also matches PASSWORD_BYPASS=devByPass)
  const passwordHash = await hash('admin123', 10);

  const users = [
    {
      nama: 'Administrator',
      email: 'admin@lemigas.esdm.go.id',
      roleId: adminRole.id,
      unitKerja: 'LEMIGAS',
    },
    {
      nama: 'Operator Pengadaan',
      email: 'operator@lemigas.esdm.go.id',
      roleId: operatorRole.id,
      unitKerja: 'Subdit Pengadaan',
    },
    {
      nama: 'Verifikator Pengadaan',
      email: 'verifikator@lemigas.esdm.go.id',
      roleId: verifikatorRole.id,
      unitKerja: 'Subdit Verifikasi',
    },
    {
      nama: 'Pimpinan LEMIGAS',
      email: 'pimpinan@lemigas.esdm.go.id',
      roleId: pimpinanRole.id,
      unitKerja: 'Kepala LEMIGAS',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nama: u.nama,
        email: u.email,
        passwordHash,
        roleId: u.roleId,
        unitKerja: u.unitKerja,
        status: 'aktif',
      },
    });
  }

  console.log(`✅ ${users.length} users created`);

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

  // 5. Vendor
  const vendorData = [
    {
      nama: 'PT Pertamina EP',
      alamat: 'Jl. Gedung Petroleum Kav. 1, Jakarta Selatan',
      telepon: '021-55501234',
      email: 'procurement@pertamina.com',
      npwp: '01.302.881.2-063.000',
      contactPerson: 'Budi Santoso',
      status: 'aktif' as const,
    },
    {
      nama: 'PT Schlumberger Indonesia',
      alamat: 'Mega Kuningan Timur Kav. E4, Jakarta Selatan',
      telepon: '021-55509876',
      email: 'sales@slb.co.id',
      npwp: '01.345.678.9-012.000',
      contactPerson: 'Andi Wijaya',
      status: 'aktif' as const,
    },
    {
      nama: 'PT Halliburton Indonesia',
      alamat: 'Kawasan Industri Pulogadung, Jakarta Timur',
      telepon: '021-46830000',
      email: 'indo@halliburton.com',
      npwp: '01.222.333.4-055.000',
      contactPerson: 'Rudi Hartono',
      status: 'aktif' as const,
    },
    {
      nama: 'PT Chevron Pacific Indonesia',
      alamat: 'Chevron Building Pluit, Jakarta Utara',
      telepon: '021-65051111',
      email: 'procurement@chevron.com',
      npwp: '01.444.555.6-077.000',
      contactPerson: 'Dewi Lestari',
      status: 'aktif' as const,
    },
    {
      nama: 'PT Medco E&P Indonesia',
      alamat: 'Medco Building, Jl. Ampera Raya, Jakarta Selatan',
      telepon: '021-78831818',
      email: 'supply@medco.co.id',
      npwp: '01.666.777.8-099.000',
      contactPerson: 'Ahmad Fauzi',
      status: 'aktif' as const,
    },
  ];

  const vendors: Record<string, any> = {};
  for (const v of vendorData) {
    let vendor = await prisma.vendor.findFirst({ where: { nama: v.nama } });
    if (!vendor) {
      vendor = await prisma.vendor.create({ data: v });
    }
    vendors[v.nama] = vendor;
  }

  console.log(`✅ ${vendorData.length} vendors created`);

  // 6. Barang
  const kategoriMap = {} as Record<string, string>;
  const allKategori = await prisma.kategoriPengadaan.findMany();
  for (const k of allKategori) {
    kategoriMap[k.kode] = k.id;
  }

  const barangData = [
    {
      nama: 'Minyak Mentah (Crude Oil)',
      spesifikasi: 'API gravity 32-38, sweet crude',
      satuan: 'barel',
      kategoriId: kategoriMap['OIL']!,
      hargaEstimasi: 850000,
    },
    {
      nama: 'Diesel Fuel',
      spesifikasi: 'Pertamina Dex, cetane number 53+',
      satuan: 'liter',
      kategoriId: kategoriMap['OIL']!,
      hargaEstimasi: 12000,
    },
    {
      nama: 'Mesin Bor (Drill Rig)',
      spesifikasi: 'Top drive, 500 ton hook load capacity',
      satuan: 'unit',
      kategoriId: kategoriMap['EQUIP']!,
      hargaEstimasi: 250000000,
    },
    {
      nama: 'Valve Gate',
      spesifikasi: '6 inch, 1500 PSI, API 6A',
      satuan: 'pcs',
      kategoriId: kategoriMap['EQUIP']!,
      hargaEstimasi: 45000000,
    },
    {
      nama: 'Mud Chemical (Barite)',
      spesifikasi: 'API grade, density 4.2 g/cm³',
      satuan: 'ton',
      kategoriId: kategoriMap['CHEM']!,
      hargaEstimasi: 3500000,
    },
    {
      nama: 'Corrosion Inhibitor',
      spesifikasi: 'Film forming amine, 95% active',
      satuan: 'liter',
      kategoriId: kategoriMap['CHEM']!,
      hargaEstimasi: 85000,
    },
    {
      nama: 'Sarung Tangan Safety',
      spesifikasi: 'EN 388 certified, cut level 5',
      satuan: 'pasang',
      kategoriId: kategoriMap['CONSUM']!,
      hargaEstimasi: 75000,
    },
    {
      nama: 'Lampu Safety Helm',
      spesifikasi: 'LED, IP67, ATEX Zone 1',
      satuan: 'pcs',
      kategoriId: kategoriMap['CONSUM']!,
      hargaEstimasi: 350000,
    },
    {
      nama: 'Jasa Kalibrasi Instrumen',
      spesifikasi: 'Kalibrasi flow meter, pressure gauge, thermocouple',
      satuan: 'set',
      kategoriId: kategoriMap['SERVICE']!,
      hargaEstimasi: 15000000,
    },
    {
      nama: 'Jasa Inspeksi Pipeline',
      spesifikasi: 'MFL & UT inspection, max 10 km',
      satuan: 'kilometer',
      kategoriId: kategoriMap['SERVICE']!,
      hargaEstimasi: 25000000,
    },
  ];

  const allBarang: any[] = [];
  for (const b of barangData) {
    const existing = await prisma.barang.findFirst({ where: { nama: b.nama } });
    if (!existing) {
      allBarang.push(await prisma.barang.create({ data: b }));
    } else {
      allBarang.push(existing);
    }
  }

  console.log(`✅ ${barangData.length} barang created`);

  // 7. Users for reference
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@lemigas.esdm.go.id' },
  });
  const operatorUser = await prisma.user.findUnique({
    where: { email: 'operator@lemigas.esdm.go.id' },
  });
  const verifikatorUser = await prisma.user.findUnique({
    where: { email: 'verifikator@lemigas.esdm.go.id' },
  });
  const pimpinanUser = await prisma.user.findUnique({
    where: { email: 'pimpinan@lemigas.esdm.go.id' },
  });

  // 8. Pengadaan
  const pengadaanData = [
    {
      nomorSurat: 'LG/PMD/2026/001',
      judul: 'Pengadaan Crude Oil Q4 2026',
      deskripsi: 'Pengadaan minyak mentah untuk kebutuhan operasional Q4 2026',
      metode: 'tender' as const,
      prioritas: 'tinggi' as const,
      status: 'diajukan' as const,
      totalEstimasi: 8500000000,
      unitKerja: 'Subdit Pengadaan',
      diajukanOleh: operatorUser?.id,
    },
    {
      nomorSurat: 'LG/PMD/2026/002',
      judul: 'Pengadaan Chemical untuk Workover',
      deskripsi: 'Pengadaan bahan kimia untuk kegiatan workover sumur',
      metode: 'pengadaan_langsung' as const,
      prioritas: 'sedang' as const,
      status: 'dalam_review' as const,
      totalEstimasi: 525000000,
      unitKerja: 'Subdit Pengadaan',
      diajukanOleh: operatorUser?.id,
    },
    {
      nomorSurat: 'LG/PMD/2026/003',
      judul: 'Pengadaan Peralatan Safety 2026',
      deskripsi: 'Pengadaan PPE dan safety equipment untuk seluruh pegawai',
      metode: 'e_procurement' as const,
      prioritas: 'rendah' as const,
      status: 'draft' as const,
      totalEstimasi: 150000000,
      unitKerja: 'Subdit Pengadaan',
      diajukanOleh: operatorUser?.id,
    },
    {
      nomorSurat: 'LG/PMD/2026/004',
      judul: 'Pengadaan Jasa Inspeksi Pipeline',
      deskripsi: 'Inspeksi pipeline输送 minyak mentah tahunan',
      metode: 'penunjukan_langsung' as const,
      prioritas: 'tinggi' as const,
      status: 'disetujui' as const,
      totalEstimasi: 500000000,
      unitKerja: 'Subdit Pengadaan',
      diajukanOleh: operatorUser?.id,
    },
    {
      nomorSurat: 'LG/PMD/2026/005',
      judul: 'Pengadaan Valve & Equipment',
      deskripsi: 'Pengadaan valve gate untuk repair bulanan',
      metode: 'pengadaan_langsung' as const,
      prioritas: 'sedang' as const,
      status: 'selesai' as const,
      totalEstimasi: 90000000,
      unitKerja: 'Subdit Pengadaan',
      diajukanOleh: operatorUser?.id,
    },
  ];

  const pengadaanRecords: any[] = [];
  for (const p of pengadaanData) {
    const existing = await prisma.pengadaan.findUnique({
      where: { nomorSurat: p.nomorSurat },
    });
    if (!existing) {
      pengadaanRecords.push(await prisma.pengadaan.create({ data: p }));
    } else {
      pengadaanRecords.push(existing);
    }
  }

  console.log(`✅ ${pengadaanData.length} pengadaan created`);

  // 9. Pengadaan Items
  const itemsData = [
    // Pengadaan 1: Crude Oil
    {
      pengadaanId: pengadaanRecords[0].id,
      barangId: allBarang[0].id,
      vendorId: vendors['PT Pertamina EP'].id,
      jumlah: 10000,
      hargaSatuan: 850000,
      status: 'dipesan' as const,
      catatan: 'Q4 delivery schedule',
    },
    // Pengadaan 2: Chemical
    {
      pengadaanId: pengadaanRecords[1].id,
      barangId: allBarang[4].id,
      vendorId: vendors['PT Schlumberger Indonesia'].id,
      jumlah: 100,
      hargaSatuan: 3500000,
      status: 'diterima' as const,
      catatan: 'Barite untuk drilling mud',
    },
    {
      pengadaanId: pengadaanRecords[1].id,
      barangId: allBarang[5].id,
      vendorId: vendors['PT Halliburton Indonesia'].id,
      jumlah: 500,
      hargaSatuan: 85000,
      status: 'dipesan' as const,
      catatan: 'Corrosion inhibitor untuk pipeline',
    },
    // Pengadaan 3: Safety
    {
      pengadaanId: pengadaanRecords[2].id,
      barangId: allBarang[6].id,
      vendorId: vendors['PT Medco E&P Indonesia'].id,
      jumlah: 500,
      hargaSatuan: 75000,
      catatan: 'Safety gloves untuk field staff',
    },
    {
      pengadaanId: pengadaanRecords[2].id,
      barangId: allBarang[7].id,
      vendorId: vendors['PT Medco E&P Indonesia'].id,
      jumlah: 200,
      hargaSatuan: 350000,
      catatan: 'Safety helmet lamp',
    },
    // Pengadaan 4: Inspection
    {
      pengadaanId: pengadaanRecords[3].id,
      barangId: allBarang[9].id,
      vendorId: vendors['PT Chevron Pacific Indonesia'].id,
      jumlah: 8,
      hargaSatuan: 25000000,
      status: 'diterima' as const,
      catatan: '8 km pipeline inspection',
    },
    // Pengadaan 5: Valve
    {
      pengadaanId: pengadaanRecords[4].id,
      barangId: allBarang[3].id,
      vendorId: vendors['PT Pertamina EP'].id,
      jumlah: 2,
      hargaSatuan: 45000000,
      status: 'diterima' as const,
      catatan: 'Gate valve replacement',
    },
  ];

  for (const item of itemsData) {
    const subtotal = item.jumlah * (item.hargaSatuan || 0);
    const existing = await prisma.pengadaanItem.findFirst({
      where: { pengadaanId: item.pengadaanId, barangId: item.barangId },
    });
    if (!existing) {
      await prisma.pengadaanItem.create({ data: { ...item, subtotal } });
    }
  }

  console.log(`✅ ${itemsData.length} pengadaan items created`);

  // 10. ApprovalWorkflow
  const approvalSteps = [
    // Pengadaan 1 (diajukan): 2 steps
    {
      pengadaanId: pengadaanRecords[0].id,
      urutan: 1,
      namaLangkah: 'Verifikasi Operator',
      penanggungJawab: null,
      status: 'disetujui' as const,
      tanggalKeputusan: new Date('2026-09-10'),
      catatan: 'Dokumen lengkap',
    },
    {
      pengadaanId: pengadaanRecords[0].id,
      urutan: 2,
      namaLangkah: 'Persetujuan Pimpinan',
      penanggungJawab: null,
      status: 'menunggu' as const,
    },
    // Pengadaan 2 (dalam_review): 2 steps
    {
      pengadaanId: pengadaanRecords[1].id,
      urutan: 1,
      namaLangkah: 'Verifikasi Operator',
      penanggungJawab: null,
      status: 'menunggu' as const,
    },
    {
      pengadaanId: pengadaanRecords[1].id,
      urutan: 2,
      namaLangkah: 'Persetujuan Pimpinan',
      penanggungJawab: null,
      status: 'menunggu' as const,
    },
    // Pengadaan 3 (draft): no approval steps yet
    // Pengadaan 4 (disetujui): both approved
    {
      pengadaanId: pengadaanRecords[3].id,
      urutan: 1,
      namaLangkah: 'Verifikasi Operator',
      penanggungJawab: verifikatorUser?.id,
      status: 'disetujui' as const,
      tanggalKeputusan: new Date('2026-08-15'),
      catatan: 'Sesuai kebutuhan inspeksi',
    },
    {
      pengadaanId: pengadaanRecords[3].id,
      urutan: 2,
      namaLangkah: 'Persetujuan Pimpinan',
      penanggungJawab: pimpinanUser?.id,
      status: 'disetujui' as const,
      tanggalKeputusan: new Date('2026-08-18'),
      catatan: 'Disetujui untuk Q3',
    },
    // Pengadaan 5 (selesai): both approved
    {
      pengadaanId: pengadaanRecords[4].id,
      urutan: 1,
      namaLangkah: 'Verifikasi Operator',
      penanggungJawab: verifikatorUser?.id,
      status: 'disetujui' as const,
      tanggalKeputusan: new Date('2026-07-20'),
      catatan: 'Urgent replacement',
    },
    {
      pengadaanId: pengadaanRecords[4].id,
      urutan: 2,
      namaLangkah: 'Persetujuan Pimpinan',
      penanggungJawab: pimpinanUser?.id,
      status: 'disetujui' as const,
      tanggalKeputusan: new Date('2026-07-22'),
      catatan: 'Approved',
    },
  ];

  for (const step of approvalSteps) {
    const existing = await prisma.approvalWorkflow.findFirst({
      where: { pengadaanId: step.pengadaanId, urutan: step.urutan },
    });
    if (!existing) {
      await prisma.approvalWorkflow.create({ data: step });
    }
  }

  console.log(`✅ ${approvalSteps.length} approval workflow steps created`);

  // 11. Dokumen
  const dokumenData = [
    {
      pengadaanId: pengadaanRecords[0].id,
      nama: 'Surat Pengajuan Crude Oil',
      tipePenyimpanan: 'upload_lokal' as const,
      filePath: 'pengadaan-001-pengajuan.pdf',
      ukuran: 245000,
      status: 'lengkap' as const,
      diunggahOleh: operatorUser?.id,
    },
    {
      pengadaanId: pengadaanRecords[0].id,
      nama: 'RAB Crude Oil Q4',
      tipePenyimpanan: 'upload_lokal' as const,
      filePath: 'pengadaan-001-rab.xlsx',
      ukuran: 89000,
      status: 'lengkap' as const,
      diunggahOleh: operatorUser?.id,
    },
    {
      pengadaanId: pengadaanRecords[1].id,
      nama: 'Spesifikasi Chemical Workover',
      tipePenyimpanan: 'upload_lokal' as const,
      filePath: 'pengadaan-002-spesifikasi.pdf',
      ukuran: 156000,
      status: 'lengkap' as const,
      diunggahOleh: operatorUser?.id,
    },
    {
      pengadaanId: pengadaanRecords[3].id,
      nama: 'Kontrak Jasa Inspeksi Pipeline',
      tipePenyimpanan: 'upload_lokal' as const,
      filePath: 'pengadaan-004-kontrak.pdf',
      ukuran: 320000,
      status: 'lengkap' as const,
      diunggahOleh: operatorUser?.id,
    },
    {
      pengadaanId: pengadaanRecords[4].id,
      nama: 'Berita Acara Serah Terima Valve',
      tipePenyimpanan: 'upload_lokal' as const,
      filePath: 'pengadaan-005-bast.pdf',
      ukuran: 98000,
      status: 'lengkap' as const,
      diunggahOleh: operatorUser?.id,
    },
  ];

  for (const d of dokumenData) {
    const existing = await prisma.dokumen.findFirst({
      where: { pengadaanId: d.pengadaanId, nama: d.nama },
    });
    if (!existing) {
      await prisma.dokumen.create({ data: d });
    }
  }

  console.log(`✅ ${dokumenData.length} dokumen created`);

  // 12. Notifikasi
  const notifikasiData = [
    {
      userId: operatorUser?.id!,
      pengadaanId: pengadaanRecords[0].id,
      referensiTabel: 'pengadaan',
      referensiId: pengadaanRecords[0].id,
      pesan: 'Pengadaan LG/PMD/2026/001 telah diajukan',
      sudahDibaca: true,
    },
    {
      userId: verifikatorUser?.id!,
      pengadaanId: pengadaanRecords[0].id,
      referensiTabel: 'pengadaan',
      referensiId: pengadaanRecords[0].id,
      pesan: 'Pengadaan LG/PMD/2026/001 menunggu verifikasi',
      sudahDibaca: false,
    },
    {
      userId: pimpinanUser?.id!,
      pengadaanId: pengadaanRecords[3].id,
      referensiTabel: 'pengadaan',
      referensiId: pengadaanRecords[3].id,
      pesan: 'Pengadaan LG/PMD/2026/004 telah disetujui',
      sudahDibaca: true,
    },
    {
      userId: operatorUser?.id!,
      pengadaanId: pengadaanRecords[4].id,
      referensiTabel: 'pengadaan',
      referensiId: pengadaanRecords[4].id,
      pesan: 'Pengadaan LG/PMD/2026/005 selesai diproses',
      sudahDibaca: false,
    },
    {
      userId: adminUser?.id!,
      referensiTabel: 'sistem',
      referensiId: adminUser?.id!,
      pesan: 'Sistem pengadaan minyak LEMIGAS telah aktif',
      sudahDibaca: true,
    },
  ];

  for (const n of notifikasiData) {
    const existing = await prisma.notifikasi.findFirst({
      where: { userId: n.userId, pesan: n.pesan },
    });
    if (!existing) {
      await prisma.notifikasi.create({ data: n });
    }
  }

  console.log(`✅ ${notifikasiData.length} notifikasi created`);

  // 13. Audit Log (sample)
  const auditData = [
    {
      tabel: 'pengadaan',
      recordId: pengadaanRecords[0].id,
      aksi: 'create',
      dilakukanOleh: operatorUser?.id,
      dataSesudah: { judul: 'Pengadaan Crude Oil Q4 2026', status: 'draft' },
    },
    {
      tabel: 'pengadaan',
      recordId: pengadaanRecords[0].id,
      aksi: 'update',
      dilakukanOleh: operatorUser?.id,
      dataSebelum: { status: 'draft' },
      dataSesudah: { status: 'diajukan' },
    },
    {
      tabel: 'pengadaan',
      recordId: pengadaanRecords[3].id,
      aksi: 'update',
      dilakukanOleh: pimpinanUser?.id,
      dataSebelum: { status: 'dalam_review' },
      dataSesudah: { status: 'disetujui' },
    },
    {
      tabel: 'vendor',
      recordId: vendors['PT Pertamina EP'].id,
      aksi: 'create',
      dilakukanOleh: adminUser?.id,
      dataSesudah: { nama: 'PT Pertamina EP', status: 'aktif' },
    },
    {
      tabel: 'user',
      recordId: operatorUser?.id!,
      aksi: 'create',
      dilakukanOleh: adminUser?.id,
      dataSesudah: {
        nama: 'Operator Pengadaan',
        email: 'operator@lemigas.esdm.go.id',
      },
    },
  ];

  for (const a of auditData) {
    const existing = await prisma.auditLog.findFirst({
      where: { tabel: a.tabel, recordId: a.recordId, aksi: a.aksi },
    });
    if (!existing) {
      await prisma.auditLog.create({ data: a });
    }
  }

  console.log(`✅ ${auditData.length} audit log entries created`);
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
