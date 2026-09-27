export enum Role {
  Admin = 'Admin',
  Operator = 'Operator',
  Verifikator = 'Verifikator',
  Pimpinan = 'Pimpinan',
}

export const ROLE_MAP: Record<string, Role> = {
  admin: Role.Admin,
  operator: Role.Operator,
  verifikator: Role.Verifikator,
  pimpinan: Role.Pimpinan,
};
