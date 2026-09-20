import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthUser } from '../auth/auth.types';
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  constructor(@Inject(REQUEST) private readonly request: { user?: AuthUser }) {}
  get organizationId(): string {
    if (!this.request.user?.organizationId) throw new ForbiddenException('Organization context required');
    return this.request.user.organizationId;
  }
  get role() { if (!this.request.user) throw new ForbiddenException('User context required'); return this.request.user.role; }
  get userId(): string {
    if (!this.request.user?.userId) throw new ForbiddenException('User context required');
    return this.request.user.userId;
  }
  assertOrganization(id: string) {
    if (id !== this.organizationId) throw new ForbiddenException('Organization mismatch');
  }
}

