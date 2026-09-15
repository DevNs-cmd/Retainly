import { Injectable } from '@nestjs/common'; import { DatabaseService } from '../data/database.service'; import { TenantContext } from '../tenant/tenant.context'; import { ResourceRepository } from '../common/resource.repository';
@Injectable() export class MembershipsRepository extends ResourceRepository<'membership'> { constructor(db: DatabaseService, tenant: TenantContext) { super(db, tenant, 'membership', true); } }

