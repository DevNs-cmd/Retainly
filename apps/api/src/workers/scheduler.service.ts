import { ActivityFeaturesExtractor } from '../risk/feature-engineering/activity-features.extractor';
import { Injectable,OnModuleInit } from '@nestjs/common';import { InjectQueue } from '@nestjs/bullmq';import { Queue } from 'bullmq';import { DatabaseService } from '../data/database.service';import { QueueNames } from '../queues/queue-names';import { withTimeout } from '../common/utils/with-timeout';
@Injectable()export class SchedulerService implements OnModuleInit{
 constructor(private readonly db:DatabaseService,private readonly features:ActivityFeaturesExtractor,@InjectQueue(QueueNames.SYNC)private readonly sync:Queue,@InjectQueue(QueueNames.ANALYTICS)private readonly analytics:Queue,@InjectQueue(QueueNames.BILLING)private readonly billing:Queue,@InjectQueue(QueueNames.AUTOMATION)private readonly automation:Queue){}
 async onModuleInit(){
  for(const [name,queue,every] of [['sync',this.sync,900000],['analytics',this.analytics,3600000],['billing',this.billing,3600000],['automation',this.automation,3600000]] as const)await withTimeout(queue.add('SCHEDULE_ORGANIZATIONS',{}, {jobId:'schedule-'+name,repeat:{every},removeOnComplete:100,removeOnFail:100}));
 }
 async dispatch(kind:'sync'|'analytics'|'billing'|'automation'){
  let after:string|undefined;const period=String(Math.floor(Date.now()/(kind==='sync'?900000:3600000)));
  while(true){
   const orgs=await this.db.organizationsForScheduling(after);
   for(const org of orgs){
    const organization=await this.db.require('organization',org.id,org.id);if(organization.deletedAt)continue;
    if(kind==='automation'){
     let cursor:string|undefined;
     do {const students=await this.db.list('student',org.id,{deletedAt:null,...(cursor?{id:{gt:cursor}}:{})},{take:100,orderBy:{id:'asc'}});
      for(const student of students){const signals=await this.features.extract(student.id,org.id);const inactivityDays=signals.daysSinceLastActivity??Math.max(0,(Date.now()-student.createdAt.getTime())/86400000);await withTimeout(this.automation.add('automation.evaluate',{organizationId:org.id,eventId:'inactivity-'+period+'-'+student.id,payload:{studentId:student.id,inactivityDays}},{jobId:org.id+'-'+student.id+'-'+period,removeOnComplete:1000}));}
      if(students.length<100)break;cursor=students[students.length-1].id;
     }while(cursor);
    }else if(kind==='sync'){
     const connections=await this.db.list('integrationConnection',org.id,{status:'CONNECTED'});
     for(const connection of connections)if(['kajabi','teachable','thinkific','podia','learnworlds','stripe','paypal'].includes(connection.provider))await withTimeout(this.sync.add('SYNC_CONNECTION',{organizationId:org.id,provider:connection.provider},{jobId:org.id+'-'+connection.provider+'-'+period,removeOnComplete:1000,removeOnFail:false}));
    }else{
     const queue=kind==='analytics'?this.analytics:this.billing;
     await withTimeout(queue.add(kind==='analytics'?'REFRESH':'CHECK_LIMITS',{organizationId:org.id,eventId:kind+'-'+period},{jobId:org.id+'-'+period,removeOnComplete:1000,removeOnFail:false}));
    }
   }
   if(orgs.length<100)break;after=orgs[orgs.length-1].id;
  }
 }
}

