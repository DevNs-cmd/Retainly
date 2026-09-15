import { Injectable,ForbiddenException } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { CoachTasksRepository } from './coach-tasks.repository';import { TenantContext } from '../tenant/tenant.context';import { Role } from '../auth/auth.types';import { ResourceQueryDto } from '../common/dto/resource-query.dto';
@Injectable()export class CoachTasksService extends ResourceService<'coachTask'>{
 constructor(repository:CoachTasksRepository,db:DatabaseService,cache:TenantCache,private readonly tenant:TenantContext){super(repository,db,cache);}
 protected filters(q:ResourceQueryDto){return {...super.filters(q),coachId:this.tenant.userId};}
 async get(id:string){const task=await super.get(id);if(task.coachId!==this.tenant.userId&&![Role.OWNER,Role.ADMIN].includes(this.tenant.role))throw new ForbiddenException('Task belongs to another coach');return task;}
}

