import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export function rolesSummary(base: string, roles: Role[]): string {
  if (!roles.length) return base;
  const names = roles.map((r) => {
    switch (r) {
      case Role.Admin:
        return 'Admin';
      case Role.Operator:
        return 'Operator';
      case Role.Verifikator:
        return 'Verifikator';
      case Role.Pimpinan:
        return 'Pimpinan';
      default:
        return r;
    }
  });
  return `${base} (${names.join(', ')})`;
}
