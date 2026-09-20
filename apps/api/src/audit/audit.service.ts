import { Injectable } from '@nestjs/common'; import { DatabaseService } from '../data/database.service';import { ResourceQueryDto } from '../common/dto/resource-query.dto';
@Injectable() export class AuditService {
 constructor(private readonly db:DatabaseService){}
 log(action:string,userId:string,orgId:string,entityType:string,entityId:string,diff:Record<string,unknown>){return this.db.create('auditLog',orgId,{action,userId,entityType,entityId,diff});}
 list(org:string,q:ResourceQueryDto){return this.db.list('auditLog',org,{}, {skip:q.skip,take:q.limit,orderBy:{createdAt:'desc'}});}
}

