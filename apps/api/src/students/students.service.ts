import { Injectable } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { StudentsRepository } from './students.repository';import { ResourceQueryDto } from '../common/dto/resource-query.dto';import { Segment } from '../data/entities';
@Injectable()export class StudentsService extends ResourceService<'student'>{
 constructor(repository:StudentsRepository,db:DatabaseService,cache:TenantCache){super(repository,db,cache);}
 protected filters(q:ResourceQueryDto){return {...super.filters(q),...(q.riskLevel?{segment:q.riskLevel}:{})};}
 async get(id:string){const student=await super.get(id);const scores=await this.db.list('riskSnapshot',this.repository.organizationId,{studentId:id},{take:1,orderBy:{calculatedAt:'desc'}});return {...student,latestRiskSnapshot:scores[0]||null};}
 atRisk(q:ResourceQueryDto){return this.repository.list(q,{segment:Segment.HIGH_RISK});}
}

