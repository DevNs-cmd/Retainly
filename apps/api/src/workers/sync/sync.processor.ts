import { Injectable,BadRequestException } from '@nestjs/common';import { Job } from 'bullmq';import { DatabaseService } from '../../data/database.service';import { ConnectionService } from '../../integrations/connection.service';import { ProviderRegistry } from '../../integrations/provider-registry';import { SyncKind,ExternalRecord } from '../../integrations/provider.interfaces';import { OutboxService } from '../../outbox/outbox.service';import { EnrollmentStatus } from '../../data/entities';import { StudentImportService } from '../../students/student-import.service';import { TenantCache } from '../../common/cache/tenant-cache.service';import { SchedulerService } from '../scheduler.service';import { JobEnvelope,envelope,stableId } from '../job-envelope';
@Injectable()export class SyncProcessor{
 constructor(private readonly db:DatabaseService,private readonly connections:ConnectionService,private readonly providers:ProviderRegistry,private readonly outbox:OutboxService,private readonly imports:StudentImportService,private readonly cache:TenantCache,private readonly scheduler:SchedulerService){}
 async process(job:Job<JobEnvelope>){
   if(job.name==='SCHEDULE_ORGANIZATIONS')return this.scheduler.dispatch('sync');
   const {organizationId:org,provider,eventId,key}=envelope(job);
   if(job.name==='IMPORT_STUDENTS'){const result=await this.imports.process(org,key!);await this.cache.invalidate(org);return result;}
   if(!provider)throw new BadRequestException('Provider required');
   const kinds:Record<string,SyncKind>={SYNC_COURSES:'courses',SYNC_STUDENTS:'students',SYNC_ENROLLMENTS:'enrollments',SYNC_PAYMENTS:'payments'};
   const sequence=job.name==='SYNC_CONNECTION'?(['stripe','paypal'].includes(provider)?['payments']:['courses','students','enrollments']) as SyncKind[]:[kinds[job.name]];
   if(!sequence[0])throw new BadRequestException('Unsupported sync job');
   const {connection,credentials}=await this.connections.load(org,provider);
   for(const kind of sequence){
     let cursor:string|undefined;const cursors=new Set<string>();
     do{
       const page=await this.providers.fetch(provider,kind,credentials,cursor);
       if(!Array.isArray(page.records)||page.records.length>10000)throw new BadRequestException('Provider page invalid');
       for(const row of page.records)await this.upsert(org,provider,kind,row,eventId);
       cursor=page.nextCursor;if(cursor&&cursors.has(cursor))throw new BadRequestException('Provider cursor repeated');if(cursor)cursors.add(cursor);
     }while(cursor);
   }
   await this.db.update('integrationConnection',org,connection.id,{lastSyncedAt:new Date()});
   await this.cache.invalidate(org);
 }
 private async upsert(org:string,provider:string,kind:SyncKind,row:ExternalRecord,eventId:string){
  if(!row.id)throw new BadRequestException('External ID missing');
  await this.db.transaction(async tx=>{
   if(kind==='courses'){
     const existing=await this.db.first('course',org,{provider,externalId:row.id},tx);
     const data={name:row.name||'Untitled course',provider,externalId:row.id,deletedAt:null};
     const course=existing?await this.db.update('course',org,existing.id,data,tx):await this.db.create('course',org,data,tx);
     await this.outbox.create({organizationId:org,eventType:'course.synced',payload:{courseId:course.id}},tx);
   }else if(kind==='students'){
     if(!row.email)throw new BadRequestException('Provider student email missing');
     const existing=await this.db.first('student',org,{provider,externalId:row.id},tx);const data={name:row.name||row.email,email:row.email,provider,externalId:row.id,deletedAt:null};
     const student=existing?await this.db.update('student',org,existing.id,data,tx):await this.db.create('student',org,data,tx);
     await this.outbox.create({organizationId:org,eventType:'student.synced',payload:{studentId:student.id}},tx);
   }else{
     if(!row.studentId)throw new BadRequestException('Provider student reference missing');
     const student=await this.db.first('student',org,{provider,externalId:row.studentId},tx);if(!student)throw new BadRequestException('Synchronized student mapping missing');
     if(kind==='enrollments'){
       if(!row.courseId)throw new BadRequestException('Provider course reference missing');
       const course=await this.db.first('course',org,{provider,externalId:row.courseId},tx);if(!course)throw new BadRequestException('Synchronized course mapping missing');
       const existing=await this.db.first('enrollment',org,{studentId:student.id,courseId:course.id},tx);
       const status=Object.values(EnrollmentStatus).includes(row.status as EnrollmentStatus)?row.status as EnrollmentStatus:EnrollmentStatus.ACTIVE;
       const data={studentId:student.id,courseId:course.id,provider,externalId:row.id,status,completionPercent:row.completionPercent||0,deletedAt:null};
       const enrollment=existing?await this.db.update('enrollment',org,existing.id,data,tx):await this.db.create('enrollment',org,data,tx);
       if(!existing||existing.status!==status)await this.outbox.create({organizationId:org,eventType:'enrollment.status.changed',payload:{studentId:student.id,status,enrollmentId:enrollment.id}},tx);
     }else{
       if(!Number.isSafeInteger(row.amountMinor)||row.amountMinor!<0||!row.currency||!/^[A-Z]{3}$/.test(row.currency)||!row.occurredAt||!Number.isFinite(Date.parse(row.occurredAt)))throw new BadRequestException('Invalid provider payment');
       const existing=await this.db.first('payment',org,{provider,externalId:row.id},tx);
       const data={studentId:student.id,provider,externalId:row.id,amountMinor:row.amountMinor||0,currency:row.currency||'USD',status:row.status||'SUCCEEDED',occurredAt:new Date(row.occurredAt||Date.now())};
       if(existing)await this.db.update('payment',org,existing.id,data,tx);else{await this.db.create('payment',org,data,tx);await this.outbox.create({organizationId:org,eventType:data.status==='FAILED'?'payment.failed':'payment.recorded',payload:{studentId:student.id}},tx);}
     }
   }
  });
 }
}

