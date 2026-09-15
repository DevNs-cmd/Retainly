import { Injectable,BadRequestException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { Job } from 'bullmq';import { DatabaseService } from '../../data/database.service';import { RiskCalculationService } from '../../risk/services/risk-calculation.service';import { Segment } from '../../data/entities';import { OutboxService } from '../../outbox/outbox.service';import { TenantCache } from '../../common/cache/tenant-cache.service';import { JobEnvelope,envelope,requiredString } from '../job-envelope';
export function riskSegment(score:number,high=0.7,medium=0.4,champion=0.1){if(score>=high)return Segment.HIGH_RISK;if(score>=medium)return Segment.MEDIUM_RISK;if(score<=champion)return Segment.CHAMPION;return Segment.LOW_RISK;}
@Injectable()export class RiskProcessor{
 constructor(private readonly db:DatabaseService,private readonly scoring:RiskCalculationService,private readonly outbox:OutboxService,private readonly cache:TenantCache,private readonly config:ConfigService){}
 async process(job:Job<JobEnvelope>){
   const {organizationId:org,eventId,payload}=envelope(job);const studentId=requiredString(payload,'studentId');
   const student=await this.db.require('student',org,studentId);if(student.deletedAt)return;
   if(await this.db.first('consumerReceipt',org,{consumer:'risk',eventId}))return;
   const result=await this.scoring.calculateStudentRisk(studentId,org);
   const high=Number(this.config.get('RISK_HIGH_THRESHOLD')||0.7),medium=Number(this.config.get('RISK_MEDIUM_THRESHOLD')||0.4),champion=Number(this.config.get('RISK_CHAMPION_THRESHOLD')||0.1);
   if(!(0<=champion&&champion<medium&&medium<high&&high<=1))throw new BadRequestException('Risk tier thresholds invalid');
   const segment=riskSegment(result.score,high,medium,champion);
   await this.db.once(org,'risk',eventId,async tx=>{
     const previous=await this.db.require('student',org,studentId,tx);
     await this.db.create('riskSnapshot',org,{studentId,...result,segment,sourceEventId:eventId,calculatedAt:new Date()},tx);
     await this.db.update('student',org,studentId,{riskScore:result.score,segment},tx);
     await this.outbox.create({organizationId:org,eventType:previous.segment!==segment?'risk.score.updated':'automation.evaluate',payload:{studentId,score:result.score,previousScore:previous.riskScore,segment}},tx);
   });
   await this.cache.invalidate(org);
 }
}

