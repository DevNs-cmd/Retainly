import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../data/database.service';
import { TenantCache } from '../common/cache/tenant-cache.service';
import { ResourceService } from '../common/resource.service';
import { SubscriptionsRepository } from './subscriptions.repository';
@Injectable()
export class SubscriptionsService extends ResourceService<'subscription'> { constructor(repository: SubscriptionsRepository, db: DatabaseService, cache: TenantCache) { super(repository, db, cache); } }

