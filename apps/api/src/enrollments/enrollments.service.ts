import { Injectable,ConflictException } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { EnrollmentsRepository } from './enrollments.repository';import { Enrollment,EnrollmentStatus } from '../data/entities';import { OutboxService } from '../outbox/outbox.service';
@Injectable()export class EnrollmentsService extends ResourceService<'enrollment'>{
 constructor(repository:EnrollmentsRepository,db:DatabaseService,cache:TenantCache,private readonly outbox:OutboxService){super(repository,db,cache);}
 async create(data:Partial<Enrollment>){
  const result=await this.db.transaction(async tx=>{await this.validate(data,tx);if(await this.db.first('enrollment',this.repository.organizationId,{studentId:data.studentId,courseId:data.courseId,deletedAt:null},tx))throw new ConflictException('Student already enrolled');const row=await this.repository.create(data,tx);await this.outbox.create({organizationId:this.repository.organizationId,eventType:'enrollment.status.changed',payload:{studentId:row.studentId,enrollmentId:row.id,status:row.status}},tx);return row;});
  await this.cache.invalidate(this.repository.organizationId);return result;
 }
 async update(id:string,data:Partial<Enrollment>){
  const result=await this.db.transaction(async tx=>{const previous=await this.db.require('enrollment',this.repository.organizationId,id,tx);await this.validate(data,tx);const row=await this.repository.update(id,data,tx);if(row.status!==previous.status)await this.outbox.create({organizationId:this.repository.organizationId,eventType:'enrollment.status.changed',payload:{studentId:row.studentId,enrollmentId:row.id,status:row.status}},tx);return row;});
  await this.cache.invalidate(this.repository.organizationId);return result;
 }
 remove(id:string){return this.update(id,{status:EnrollmentStatus.CANCELLED,deletedAt:new Date()});}
}

