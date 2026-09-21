import { Injectable } from '@nestjs/common';import { DatabaseService } from '../../data/database.service';import { TenantContext } from '../../tenant/tenant.context';import { ResourceQueryDto } from '../../common/dto/resource-query.dto';
@Injectable()export class RiskScoreRepository{
 constructor(private readonly db:DatabaseService,private readonly tenant:TenantContext){}
 list(q:ResourceQueryDto){return this.db.list('riskSnapshot',this.tenant.organizationId,{...(q.riskLevel||q.segment?{segment:q.riskLevel||q.segment}:{} )},{skip:q.skip,take:q.limit,orderBy:{calculatedAt:'desc'},distinct:['studentId']});}
 history(studentId:string,q:ResourceQueryDto){return this.db.list('riskSnapshot',this.tenant.organizationId,{studentId},{skip:q.skip,take:q.limit,orderBy:{calculatedAt:'desc'}});}
}

