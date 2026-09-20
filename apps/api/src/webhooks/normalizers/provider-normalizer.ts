import { Injectable,BadRequestException,UnprocessableEntityException } from '@nestjs/common';import { createHash } from 'node:crypto';import { ActivityType } from '../../activities/dto/create-activity.dto';
export interface NormalizedWebhook{
 eventId:string;occurredAt:string;activityType?:ActivityType;studentId?:string;studentExternalId?:string;email?:string;courseExternalId?:string;
 payment?:{externalId:string;amountMinor:number;currency:string;status:string};
 subscription?:{externalId:string;status:string};billingSubscriptionId?:string;campaignRecipientId?:string;
}
function obj(x:unknown):Record<string,unknown>{return x&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:{};}
function str(x:unknown){return typeof x==='string'||typeof x==='number'?String(x):undefined;}
@Injectable()export class ProviderNormalizer{
 normalize(provider:string,value:unknown,raw:Buffer):NormalizedWebhook[]{
  let values:unknown[]=Array.isArray(value)?value:[value];const root=obj(value);
  if(provider==='mailchimp'&&typeof root.mandrill_events==='string')values=JSON.parse(root.mandrill_events);
  if(values.length>100)throw new BadRequestException('Webhook batch too large');
  return values.map((item,index)=>{
   const event=obj(item),data=obj(event.data),resource=obj(data.object||data),metadata=obj(resource.metadata),user=obj(resource.user||resource.contact||event.subscriber),message=obj(event.msg);
   const type=String(event.type||event.event||event.key||event.topic||'').toLowerCase();
   const created=event.created||event.created_at||event.fired_at||event.ts||event.occurred_at;
   const when=typeof created==='number'?new Date(created*1000):new Date(String(created||''));
   if(!Number.isFinite(when.getTime()))throw new BadRequestException('Webhook occurrence timestamp required');
   const result:NormalizedWebhook={eventId:str(event.id||event.event_id||event._id)||createHash('sha256').update(raw).update(String(index)).digest('hex'),occurredAt:when.toISOString(),
    studentId:str(metadata.studentId||event.studentId),studentExternalId:str(resource.user_id||resource.student_id||user.id),email:str(resource.email||user.email||message.email),courseExternalId:str(resource.course_id),campaignRecipientId:str(metadata.campaignRecipientId||event.campaignRecipientId)};
   const types:Record<string,ActivityType>={
    'lesson.complete':ActivityType.LESSON_COMPLETE,'lesson.completed':ActivityType.LESSON_COMPLETE,'lessonprogress.created':ActivityType.LESSON_COMPLETE,
    'course.complete':ActivityType.COURSE_COMPLETE,'course.completed':ActivityType.COURSE_COMPLETE,'enrollment.completed':ActivityType.COURSE_COMPLETE,
    'email.opened':ActivityType.EMAIL_OPENED,'open':ActivityType.EMAIL_OPENED,'email.clicked':ActivityType.EMAIL_CLICKED,'click':ActivityType.EMAIL_CLICKED,
    'unsubscribed':ActivityType.UNSUBSCRIBED,'unsubscribe':ActivityType.UNSUBSCRIBED,'subscriber.unsubscribe':ActivityType.UNSUBSCRIBED,
    'payment.succeeded':ActivityType.PAYMENT_MADE,'payment_intent.succeeded':ActivityType.PAYMENT_MADE,'invoice.paid':ActivityType.PAYMENT_MADE,
    'payment.failed':ActivityType.PAYMENT_FAILED,'payment_intent.payment_failed':ActivityType.PAYMENT_FAILED,'invoice.payment_failed':ActivityType.PAYMENT_FAILED,
    'subscription.cancelled':ActivityType.SUBSCRIPTION_CANCELLED,'customer.subscription.deleted':ActivityType.SUBSCRIPTION_CANCELLED,
   };
   if(provider==='stripe'&&type.startsWith('customer.subscription.')&&!result.studentId){result.billingSubscriptionId=str(resource.id);return result;}
   result.activityType=types[type];if(!result.activityType)throw new UnprocessableEntityException('Unsupported webhook event: '+type);
   if(provider==='stripe'&&[ActivityType.PAYMENT_MADE,ActivityType.PAYMENT_FAILED].includes(result.activityType)){
    const amount=Number(resource.amount_received??resource.amount_paid??resource.amount??resource.amount_due);
    if(!Number.isSafeInteger(amount)||amount<0||typeof resource.currency!=='string')throw new BadRequestException('Payment amount/currency required');
    result.payment={externalId:String(resource.id),amountMinor:amount,currency:resource.currency.toUpperCase(),status:result.activityType===ActivityType.PAYMENT_FAILED?'FAILED':'SUCCEEDED'};
   }
   if(result.activityType===ActivityType.SUBSCRIPTION_CANCELLED)result.subscription={externalId:String(resource.id),status:'CANCELLED'};
   if(!result.studentId&&!result.studentExternalId&&!result.email)throw new BadRequestException('Webhook student identity missing');
   return result;
  });
 }
}

