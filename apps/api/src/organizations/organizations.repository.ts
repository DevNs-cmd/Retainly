import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../data/database.service';
import { TenantContext } from '../tenant/tenant.context';
import { ResourceRepository } from '../common/resource.repository';
@Injectable() export class OrganizationsRepository extends ResourceRepository<'organization'> {
 constructor(db: DatabaseService, tenant: TenantContext) { super(db, tenant, 'organization', true); }
}

