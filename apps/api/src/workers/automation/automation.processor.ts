import { SchedulerService } from '../scheduler.service';
import { Injectable } from '@nestjs/common';import { Job } from 'bullmq';import { DatabaseService } from '../../data/database.service';import { OutboxService } from '../../outbox/outbox.service';import { matchesTrigger,EvaluationEvent } from '../../automation/trigger-evaluator';import { ActionType,TaskStatus } from '../../data/entities';import { BillingService } from '../../billing/billing.service';import { JobEnvelope,envelope,requiredString,stableId } from '../job-envelope';
@Injectable()export class AutomationProcessor{
 constructor(private readonly db:DatabaseService,private readonly outbox:OutboxService,private readonly billing:BillingService,private readonly scheduler:SchedulerService){}
 async process(job:Job<JobEnvelope>){
   if(job.name==='SCHEDULE_ORGANIZATIONS')return this.scheduler.dispatch('automation');
   const {organizationId:org,eventId,payload}=envelope(job);const studentId=requiredString(payload,'studentId');
   if(!await this.billing.checkFeatureAccess(org,'automation'))return;
   const student=await this.db.require('student',org,studentId);if(student.deletedAt)return;
   const rules=await this.db.list('automationRule',org,{isActive:true,deletedAt:null});
   for(const rule of rules){
     if(payload.ruleId&&payload.ruleId!==rule.id)continue;
     if(!matchesTrigger(rule.trigger,{...payload,type:payload.type==='MANUAL'?'MANUAL':job.name} as EvaluationEvent))continue;
     await this.db.once(org,'automation-'+rule.id,eventId,async tx=>{
       const recent=await this.db.first('automationExecution',org,{ruleId:rule.id,studentId,executedAt:{gte:new Date(Date.now()-rule.cooldownHours*3600000)}},tx);
       if(recent)return;
       const execution=await this.db.create('automationExecution',org,{ruleId:rule.id,studentId,sourceEventId:eventId,status:rule.actions.some(a=>![ActionType.MARK_REVIEWED,ActionType.ASSIGN_COACH_TASK].includes(a.type))?'DISPATCHED':'COMPLETED',executedAt:new Date()},tx);
       for(let i=0;i<rule.actions.length;i++){
         const action=rule.actions[i];const actionId=stableId(execution.id,String(i));
         if(action.type===ActionType.MARK_REVIEWED)await this.db.update('student',org,studentId,{reviewedAt:new Date()},tx);
         else if(action.type===ActionType.ASSIGN_COACH_TASK){
           await this.db.require('user',org,action.config.coachId!,tx);
           await this.db.create('coachTask',org,{id:actionId,studentId,coachId:action.config.coachId!,automationRuleId:rule.id,title:action.config.title!,status:TaskStatus.PENDING,deletedAt:null},tx);
         }else await this.outbox.create({organizationId:org,eventType:'automation.action.requested',payload:{studentId,action:JSON.parse(JSON.stringify(action)),actionId,executionId:execution.id,actionCount:rule.actions.filter(a=>![ActionType.MARK_REVIEWED,ActionType.ASSIGN_COACH_TASK].includes(a.type)).length}},tx);
       }
     });
   }
 }
}

