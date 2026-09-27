import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.module.js';
import { StatusPengadaan, StatusApproval } from '@prisma/client';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit pengadaan for approval — creates approval steps and changes status
   */
  async submitForApproval(pengadaanId: string, userId: string) {
    const pengadaan = await this.prisma.pengadaan.findUnique({
      where: { id: pengadaanId },
      include: { approvalSteps: true },
    });

    if (!pengadaan) throw new Error('Pengadaan tidak ditemukan');
    if (!['draft', 'revisi'].includes(pengadaan.status)) {
      throw new Error('Pengadaan tidak dapat diajukan');
    }

    // Create standard approval workflow: Operator → Verifikator → Pimpinan
    const steps = await this.prisma.$transaction(async (tx) => {
      // Delete existing steps if any (resubmit)
      await tx.approvalWorkflow.deleteMany({
        where: { pengadaanId },
      });

      const created = await tx.approvalWorkflow.createMany({
        data: [
          {
            pengadaanId,
            urutan: 1,
            namaLangkah: 'Review Operator',
            status: 'menunggu',
          },
          {
            pengadaanId,
            urutan: 2,
            namaLangkah: 'Verifikasi',
            status: 'menunggu',
          },
          {
            pengadaanId,
            urutan: 3,
            namaLangkah: 'Persetujuan Pimpinan',
            status: 'menunggu',
          },
        ],
      });

      // Update pengadaan status
      await tx.pengadaan.update({
        where: { id: pengadaanId },
        data: { status: 'diajukan' },
      });

      return created;
    });

    return steps;
  }

  /**
   * Process an approval step decision
   */
  async processDecision(
    pengadaanId: string,
    stepId: string,
    decision: 'disetujui' | 'ditolak',
    catatan: string | undefined,
    userId: string,
  ) {
    const step = await this.prisma.approvalWorkflow.findUnique({
      where: { id: stepId },
      include: { pengadaan: true },
    });

    if (!step) throw new Error('Approval step tidak ditemukan');
    if (step.pengadaanId !== pengadaanId)
      throw new Error('Step tidak sesuai pengadaan');
    if (step.status !== 'menunggu') throw new Error('Step sudah diproses');

    const result = await this.prisma.$transaction(async (tx) => {
      // Update step
      const updatedStep = await tx.approvalWorkflow.update({
        where: { id: stepId },
        data: {
          status: decision,
          penanggungJawab: userId,
          tanggalKeputusan: new Date(),
          catatan,
        },
      });

      if (decision === 'ditolak') {
        // Reject pengadaan
        await tx.pengadaan.update({
          where: { id: pengadaanId },
          data: { status: 'ditolak' },
        });

        // Mark remaining steps as skipped (ditolak)
        await tx.approvalWorkflow.updateMany({
          where: {
            pengadaanId,
            urutan: { gt: step.urutan },
            status: 'menunggu',
          },
          data: { status: 'ditolak' },
        });
      } else {
        // Check if this was the last step
        const nextStep = await tx.approvalWorkflow.findFirst({
          where: {
            pengadaanId,
            urutan: { gt: step.urutan },
            status: 'menunggu',
          },
        });

        if (!nextStep) {
          // All steps approved → setujui pengadaan
          await tx.pengadaan.update({
            where: { id: pengadaanId },
            data: { status: 'disetujui' },
          });
        } else {
          // Update pengadaan to dalam_review
          await tx.pengadaan.update({
            where: { id: pengadaanId },
            data: { status: 'dalam_review' },
          });
        }
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          tabel: 'approval_workflow',
          recordId: stepId,
          aksi: decision,
          dilakukanOleh: userId,
          dataSebelum: step as any,
          dataSesudah: updatedStep as any,
        },
      });

      return updatedStep;
    });

    return result;
  }
}
