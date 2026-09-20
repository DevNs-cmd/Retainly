import { Injectable } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceQueryDto } from '../common/dto/resource-query.dto';
@Injectable()export class AnalyticsService{
 constructor(private readonly db:DatabaseService,private readonly cache:TenantCache){}
 read(org:string,kind:string,q:ResourceQueryDto){return this.cache.remember(org,'analytics-'+kind,q,60,()=>this.db.list('analyticsAggregate',org,{kind},{skip:q.skip,take:q.limit,orderBy:{period:'desc'}}));}
}

