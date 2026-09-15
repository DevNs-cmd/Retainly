import { Injectable } from '@nestjs/common';
import { TenantContext } from '../tenant/tenant.context';
import { ActivitiesRepository } from './activities.repository';
import { ActivityIngestionService } from './activity-ingestion.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';
@Injectable()
export class ActivitiesService {
  constructor(private readonly tenant: TenantContext, private readonly repository: ActivitiesRepository, private readonly ingestion: ActivityIngestionService) {}
  list(query: ListActivitiesDto) { return this.repository.list(this.tenant.organizationId, query); }
  async create(dto: CreateActivityDto) { return (await this.ingestion.ingest(this.tenant.organizationId, [dto]))[0]; }
  batch(events: CreateActivityDto[]) { return this.ingestion.ingest(this.tenant.organizationId, events); }
}
