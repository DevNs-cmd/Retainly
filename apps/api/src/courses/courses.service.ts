import { Injectable } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { CoursesRepository } from './courses.repository';
@Injectable()export class CoursesService extends ResourceService<'course'>{
 constructor(repository:CoursesRepository,db:DatabaseService,cache:TenantCache){super(repository,db,cache);}
 async get(id:string){return {...await super.get(id),enrolledCount:await this.db.count('enrollment',this.repository.organizationId,{courseId:id,deletedAt:null})};}
}

