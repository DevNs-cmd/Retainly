import { InvitationService } from '../../memberships/invitation.service';
import { AutomationCompletionService } from '../../automation/automation-completion.service';
import { Injectable,BadRequestException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { Job } from 'bullmq';import { DatabaseService } from '../../data/database.service';import { NotificationService } from '../../notifications/notifications.service';import { OutboxService } from '../../outbox/outbox.service';import { ProviderHttp } from '../../integrations/provider-http.service';import { BillingService } from '../../billing/billing.service';import { CampaignStatus,Action,ActionType,Channel } from '../../data/entities';import { JobEnvelope,envelope,requiredString,stableId } from '../job-envelope';
@Injectable()export class NotificationProcessor{
 constructor(private readonly db:DatabaseService,private readonly notifications:NotificationService,private readonly outbox:OutboxService,private readonly http:ProviderHttp,private readonly config:ConfigService,private readonly billing:BillingService,private readonly completion:AutomationCompletionService,private readonly invitations:InvitationService){}
 async process(job:Job<JobEnvelope>){
   const result=await this.execute(job);
   await this.completion.complete(job.data.organizationId,job.data.payload||{});
   return result;
 }
 private async execute(job:Job<JobEnvelope>){
   const {organizationId:org,eventId,payload}=envelope(job);
   if(job.name==='membership.invited')return this.invitations.deliver(org,eventId,payload);
   if(job.name==='campaign.scheduled')return this.campaign(org,requiredString(payload,'campaignId'),requiredString(payload,'scheduledAt'),eventId);
   if(job.name==='payment.failed')return this.notifications.ownerAlert(org,'Payment failed','A student payment failed. Review the payment feed.',eventId);
   if(job.name==='automation.action.requested'){
     const action=payload.action as unknown as Action;const studentId=requiredString(payload,'studentId');
     if(action.type===ActionType.ADD_TO_CAMPAIGN)return this.campaignRecipient(org,action.config.campaignId!,studentId,eventId);
     if(action.type===ActionType.WEBHOOK){
       const endpoints=JSON.parse(this.config.get<string>('AUTOMATION_WEBHOOK_ENDPOINTS_JSON')||'{}') as Record<string,{url:string;token:string}>;
       const endpoint=endpoints[action.config.endpointKey!];if(!endpoint)throw new BadRequestException('Automation endpoint not configured');
       if(await this.db.first('consumerReceipt',org,{consumer:'webhook-action',eventId}))return;
       await this.http.request(endpoint.url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+endpoint.token,'Idempotency-Key':eventId},body:JSON.stringify({organizationId:org,studentId,eventId})});
       await this.db.once(org,'webhook-action',eventId,async()=>undefined);return;
     }
     return this.deliver(org,eventId,{...action.config,studentId,channel:action.type.replace('SEND_','')},job.attemptsMade);
   }
   if(job.name==='notification.send'||['SEND_EMAIL','SEND_SMS','SEND_SLACK'].includes(job.name))return this.deliver(org,eventId,{...payload,...(job.name.startsWith('SEND_')?{channel:job.name.slice(5)}:{})},job.attemptsMade);
   throw new BadRequestException('Unknown notification job');
 }
 private async campaign(org:string,id:string,scheduledAt:string,eventId:string){
   const campaign=await this.db.require('campaign',org,id);
   if(campaign.archivedAt||campaign.status===CampaignStatus.PAUSED||campaign.status===CampaignStatus.COMPLETED||campaign.scheduledAt?.toISOString()!==scheduledAt)return;
   if(new Date(scheduledAt).getTime()>Date.now()+1000)throw new BadRequestException('Campaign is not due');
   await this.db.update('campaign',org,id,{status:CampaignStatus.RUNNING});
   let cursor:string|undefined;
   while(true){
     const students=await this.db.list('student',org,{deletedAt:null,...(campaign.segment?{segment:campaign.segment}:{}),...(cursor?{id:{gt:cursor}}:{})},{take:100,orderBy:{id:'asc'}});
     for(const student of students){
       const current=await this.db.require('campaign',org,id);if(current.status===CampaignStatus.PAUSED||current.archivedAt)return;
       await this.campaignRecipient(org,id,student.id,eventId);
     }
     if(students.length<100)break;cursor=students[students.length-1].id;
   }
   const paused=await this.db.list('campaignRecipient',org,{campaignId:id,status:'PAUSED'});
   for(const recipient of paused)await this.db.transaction(async tx=>{
     await this.db.update('campaignRecipient',org,recipient.id,{status:'PENDING'},tx);
     await this.outbox.create({organizationId:org,eventType:'notification.send',payload:{studentId:recipient.studentId,channel:recipient.channel,templateId:campaign.templateId,message:campaign.message||'',campaignRecipientId:recipient.id}},tx);
   });
   await this.db.update('campaign',org,id,{dispatchCompleted:true});
   await this.finishCampaign(org,id);
 }
 private async campaignRecipient(org:string,campaignId:string,studentId:string,eventId:string){
   const campaign=await this.db.require('campaign',org,campaignId);if(campaign.archivedAt||campaign.status===CampaignStatus.PAUSED)return;
   const student=await this.db.require('student',org,studentId);if(student.deletedAt)return;
   await this.db.once(org,'campaign-recipient',campaignId+'-'+studentId,async tx=>{
     const channels=campaign.type===Channel.MIXED?['EMAIL','SMS']:[campaign.type];
     for(const channel of channels){
       const id=stableId(campaignId,studentId,channel);
       const recipient=await this.db.create('campaignRecipient',org,{id,campaignId,studentId,channel,status:'PENDING'},tx);
       await this.outbox.create({organizationId:org,eventType:'notification.send',payload:{studentId,channel,templateId:campaign.templateId,message:campaign.message||'',campaignRecipientId:recipient.id}},tx);
     }
   });
 }
 private async deliver(org:string,eventId:string,data:Record<string,unknown>,attempt:number){
   const channel=requiredString(data,'channel');
   const campaignRecipientId=typeof data.campaignRecipientId==='string'?data.campaignRecipientId:undefined;
   let campaignId:string|undefined;
   if(campaignRecipientId){
     const recipient=await this.db.require('campaignRecipient',org,campaignRecipientId);campaignId=recipient.campaignId;
     eventId=stableId(org,'recipient',recipient.id);
     if(['SENT','SKIPPED','FAILED','UNCERTAIN'].includes(recipient.status)){await this.finishCampaign(org,campaignId);return;}
     const campaign=await this.db.require('campaign',org,campaignId);
     if(campaign.status===CampaignStatus.PAUSED||campaign.archivedAt){await this.db.update('campaignRecipient',org,recipient.id,{status:campaign.archivedAt?'SKIPPED':'PAUSED'});return;}
   }
   const studentId=typeof data.studentId==='string'?data.studentId:undefined;
   const student=studentId?await this.db.require('student',org,studentId):undefined;
   if(channel==='EMAIL'&&!student&&typeof data.to==='string'){
     const target=await this.db.first('student',org,{email:data.to.toLowerCase(),deletedAt:null});
     if(target?.emailOptOut)return;
   }
   if(student?.deletedAt||(channel==='EMAIL'&&student?.emailOptOut)){
     if(campaignRecipientId){await this.db.update('campaignRecipient',org,campaignRecipientId,{status:'SKIPPED'});await this.finishCampaign(org,campaignId!);}return;
   }
   const recipient=channel==='SLACK'?requiredString(data,'channelId'):typeof data.to==='string'?data.to:channel==='EMAIL'?student?.email:student?.phone;
   if(!recipient)throw new BadRequestException('Notification recipient missing');
   if(channel==='SMS'&&!await this.billing.checkFeatureAccess(org,'sms'))throw new BadRequestException('SMS requires a higher plan');
   if(channel==='SLACK'&&!await this.billing.checkFeatureAccess(org,'slack'))throw new BadRequestException('Slack requires a higher plan');
   // A database claim serializes concurrent deliveries. Never automatically resend an ambiguous send.
   const log=await this.db.transaction(async tx=>{
     const existing=await this.db.first('notificationLog',org,{sourceEventId:eventId},tx);
     if(existing)return existing;
     return this.db.create('notificationLog',org,{id:stableId(org,'delivery',eventId),sourceEventId:eventId,channel,recipient,status:'PENDING',attemptCount:attempt+1,templateId:typeof data.templateId==='string'?data.templateId:null},tx);
   });
   if(log.status==='SENT'){if(campaignId)await this.finishCampaign(org,campaignId);return;}
   if(['SENDING','UNCERTAIN','FAILED'].includes(log.status))throw new BadRequestException('Delivery requires reconciliation; automatic resend suppressed');
   await this.db.transaction(async tx=>{
     const current=await this.db.require('notificationLog',org,log.id,tx);
     if(current.status!=='PENDING')throw new BadRequestException('Delivery already claimed');
     await this.db.update('notificationLog',org,log.id,{status:'SENDING',attemptCount:attempt+1},tx);
   });
   let providerMessageId:string;
   try{
     if(channel==='EMAIL')providerMessageId=await this.notifications.sendEmail(org,recipient,requiredString(data,'templateId'),{studentName:student?.name||''},eventId);
     else if(channel==='SMS')providerMessageId=await this.notifications.sendSms(org,recipient,requiredString(data,'message'),eventId);
     else if(channel==='SLACK')providerMessageId=await this.notifications.sendSlack(org,recipient,requiredString(data,'message'),eventId);
     else throw new BadRequestException('Unsupported notification channel');
   }catch(error){
     await this.db.update('notificationLog',org,log.id,{status:'UNCERTAIN',errorCode:'DELIVERY_RECONCILIATION_REQUIRED'});
     if(campaignRecipientId)await this.db.update('campaignRecipient',org,campaignRecipientId,{status:'UNCERTAIN'});
     if(campaignId)await this.finishCampaign(org,campaignId);
     throw error;
   }
   // If this transaction fails, the SENDING claim remains and retries cannot duplicate the send.
   await this.db.transaction(async tx=>{
     await this.db.update('notificationLog',org,log.id,{status:'SENT',providerMessageId,sentAt:new Date(),errorCode:null},tx);
     if(campaignRecipientId)await this.db.update('campaignRecipient',org,campaignRecipientId,{status:'SENT',sentAt:new Date()},tx);
   });
   if(campaignId)await this.finishCampaign(org,campaignId);
 }
 private async finishCampaign(org:string,id:string){
   const campaign=await this.db.require('campaign',org,id);
   if(campaign.status!==CampaignStatus.PAUSED&&campaign.dispatchCompleted&&await this.db.count('campaignRecipient',org,{campaignId:id,status:{in:['PENDING','PROCESSING','PAUSED']}})===0)await this.db.update('campaign',org,id,{status:CampaignStatus.COMPLETED});
 }
 async failed(job:Job<JobEnvelope>){
   if(job.attemptsMade<(job.opts.attempts||3))return;
   const {organizationId:org,eventId,payload}=envelope(job);
   await this.completion.complete(org,payload,true);
   if(typeof payload.campaignRecipientId==='string'){
     const recipient=await this.db.require('campaignRecipient',org,payload.campaignRecipientId);
     if(!['SENT','SKIPPED','UNCERTAIN'].includes(recipient.status))await this.db.update('campaignRecipient',org,recipient.id,{status:'FAILED'});
     await this.finishCampaign(org,recipient.campaignId);
   }
   await this.notifications.ownerAlert(org,'Notification failed','A notification exhausted its delivery retries.',eventId+'-failure');
 }
}

