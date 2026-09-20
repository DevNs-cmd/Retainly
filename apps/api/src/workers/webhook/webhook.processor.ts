import { Injectable,BadRequestException } from '@nestjs/common';import { DatabaseService } from '../../data/database.service';import { ActivityIngestionService } from '../../activities/activity-ingestion.service';import { ActivityType } from '../../activities/dto/create-activity.dto';import { OutboxService } from '../../outbox/outbox.service';import { WebhookIdempotencyService } from '../../webhooks/idempotency/webhook-idempotency.service';import { WebhookJobData } from './webhook.jobs';import { stableId } from '../job-envelope';import { EnrollmentStatus } from '../../data/entities';
@Injectable()export class WebhookProcessor{
 constructor(private readonly db:DatabaseService,private readonly ingestion:ActivityIngestionService,private readonly outbox:OutboxService,private readonly idempotency:WebhookIdempotencyService){}
 async process(data:WebhookJobData){
  const org=data.organizationId,event=data.normalized;if(!org||!event)throw new BadRequestException('Invalid webhook job');
  const key=this.idempotency.key(org,data.provider,data.eventId);if(key!==data.idempotencyKey)throw new BadRequestException('Webhook identity mismatch');
  await this.db.once(org,'webhook-'+data.provider,data.eventId,async tx=>{
   if(event.billingSubscriptionId){await this.outbox.create({organizationId:org,eventType:'billing.subscription.changed',payload:{subscriptionId:event.billingSubscriptionId}},tx);return;}
   const student=event.studentId?await this.db.require('student',org,event.studentId,tx):await this.db.first('student',org,event.studentExternalId?{provider:data.provider,externalId:event.studentExternalId,deletedAt:null}:{email:event.email,deletedAt:null},tx);
   if(!student||student.deletedAt)throw new BadRequestException('Webhook student mapping unavailable');
   const activityPayload:Record<string,string>={providerEventId:data.eventId};let courseId:string|undefined;
   if(event.courseExternalId){const course=await this.db.first('course',org,{provider:data.provider,externalId:event.courseExternalId,deletedAt:null},tx);if(!course)throw new BadRequestException('Webhook course mapping missing');courseId=course.id;activityPayload.courseId=course.id;}
   await this.ingestion.ingest(org,[{studentId:student.id,activityType:event.activityType!,source:data.provider,payload:activityPayload,occurredAt:event.occurredAt}],stableId(key),tx);
   if(event.payment){const existing=await this.db.first('payment',org,{provider:data.provider,externalId:event.payment.externalId},tx);const payment={...event.payment,provider:data.provider,studentId:student.id,occurredAt:new Date(event.occurredAt)};if(existing)await this.db.update('payment',org,existing.id,payment,tx);else await this.db.create('payment',org,payment,tx);}
   if(event.subscription){const subscription=await this.db.first('subscription',org,{provider:data.provider,externalId:event.subscription.externalId},tx);if(!subscription)throw new BadRequestException('Subscription mapping missing');await this.db.update('subscription',org,subscription.id,{status:EnrollmentStatus.CANCELLED,cancelledAt:new Date(event.occurredAt)},tx);}
   if(event.activityType===ActivityType.UNSUBSCRIBED)await this.db.update('student',org,student.id,{emailOptOut:true},tx);
   if(event.activityType===ActivityType.COURSE_COMPLETE&&courseId){const enrollment=await this.db.first('enrollment',org,{studentId:student.id,courseId,deletedAt:null},tx);if(enrollment)await this.db.update('enrollment',org,enrollment.id,{status:EnrollmentStatus.COMPLETED,completionPercent:100},tx);}
   if(event.campaignRecipientId){const recipient=await this.db.require('campaignRecipient',org,event.campaignRecipientId,tx);if(recipient.studentId!==student.id)throw new BadRequestException('Campaign recipient mismatch');await this.db.update('campaignRecipient',org,recipient.id,event.activityType===ActivityType.EMAIL_OPENED?{openedAt:new Date(event.occurredAt)}:event.activityType===ActivityType.PAYMENT_MADE?{convertedAt:new Date(event.occurredAt)}:{},tx);}
  });
  await this.idempotency.markProcessed(key);
 }
}

