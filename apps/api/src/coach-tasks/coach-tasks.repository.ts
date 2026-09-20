import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../data/database.service';
import { TenantContext } from '../tenant/tenant.context';
import { ResourceRepository } from '../common/resource.repository';
@Injectable()
export class CoachTasksRepository extends ResourceRepository<'coachTask'> { constructor(db: DatabaseService, tenant: TenantContext) { super(db, tenant, 'coachTask', true); } }

