import { Injectable,BadRequestException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { Job } from 'bullmq';import { BillingService } from '../../billing/billing.service';import { DatabaseService } from '../../data/database.service';import { StripeAdapter } from '../../integrations/payments/stripe/stripe.adapter';import { NotificationService } from '../../notifications/notifications.service';import { PlanTier } from '../../data/entities';import { SchedulerService } from '../scheduler.service';import { JobEnvelope,envelope } from '../job-envelope';
@Injectable()export class BillingProcessor{
 constructor(private readonly billing:BillingService,private readonly db:DatabaseService,private readonly stripe:StripeAdapter,private readonly notifications:NotificationService,private readonly config:ConfigService,private readonly scheduler:SchedulerService){}
 async process(job:Job<JobEnvelope>){
  if(job.name==='SCHEDULE_ORGANIZATIONS')return this.scheduler.dispatch('billing');
  const {organizationId:org,eventId,payload}=envelope(job);
  if(job.name==='TRACK_USAGE')return this.billing.trackUsage(org,String(job.data.metric||payload.metric),Number(job.data.delta||payload.delta),eventId);
  if(job.name==='SYNC_STRIPE_SUBSCRIPTION'||job.name==='billing.subscription.changed'){
   const id=job.data.subscriptionId||String(payload.subscriptionId||'');if(!id)throw new BadRequestException('Subscription ID required');
   const subscription=await this.stripe.getSubscription(id);const organization=await this.db.require('organization',org,org);
   if(subscription.customer!==organization.stripeCustomerId)throw new BadRequestException('Stripe customer does not belong to organization');
   const prices=JSON.parse(this.config.get<string>('STRIPE_PRICE_IDS_JSON')||'{}') as Record<PlanTier,string>;
   const tier=Object.entries(prices).find(([,price])=>price===subscription.items.data[0]?.price.id)?.[0] as PlanTier|undefined;
   if(!tier)throw new BadRequestException('Unknown subscription price');
   const effective=['active','trialing'].includes(subscription.status)?tier:PlanTier.STARTER;
   return this.db.transaction(async tx=>{await this.db.update('organization',org,org,{planTier:effective},tx);const existing=await this.db.first('billingSubscription',org,{stripeSubscriptionId:id},tx);const data={stripeSubscriptionId:id,stripeCustomerId:subscription.customer,status:subscription.status,planTier:effective,currentPeriodEnd:new Date(subscription.current_period_end*1000)};return existing?this.db.update('billingSubscription',org,existing.id,data,tx):this.db.create('billingSubscription',org,data,tx);});
  }
  if(job.name!=='CHECK_LIMITS')throw new BadRequestException('Unknown billing job');
  const organization=await this.db.require('organization',org,org);const usage=await this.billing.usage(org);const limits=this.billing.limits(organization.planTier);
  for(const metric of ['students','courses','emails'] as const){
   const quantity=usage[metric],limit=limits[metric];
   await this.db.transaction(async tx=>{const periodStart=new Date(usage.period+'-01T00:00:00Z');const existing=await this.db.first('usage',org,{metric,periodStart},tx);if(existing)await this.db.update('usage',org,existing.id,{quantity},tx);else await this.db.create('usage',org,{metric,periodStart,quantity},tx);});
   const level=quantity>=limit?100:quantity>=limit*0.8?80:0;
   if(level)await this.notifications.ownerAlert(org,'Usage limit warning',metric+' usage reached '+level+'% of the plan limit.',usage.period+'-'+metric+'-'+level);
  }
 }
}


