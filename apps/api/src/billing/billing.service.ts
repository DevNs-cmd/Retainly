import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common'; import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../data/database.service'; import { RedisService } from '../redis/redis.module'; import { StripeAdapter } from '../integrations/payments/stripe/stripe.adapter'; import { FEATURES, PLAN_ORDER, DEFAULT_LIMITS } from './plan-policy'; import { PlanTier } from '../data/entities';
@Injectable() export class BillingService {
 constructor(private readonly db: DatabaseService, private readonly redis: RedisService, private readonly stripe: StripeAdapter, private readonly config: ConfigService) {}
 async checkFeatureAccess(org: string, feature: string) { const required = FEATURES[feature]; if (!required) return false; const organization = await this.db.require('organization', org, org); return PLAN_ORDER.indexOf(organization.planTier) >= PLAN_ORDER.indexOf(required); }
 period() { return new Date().toISOString().slice(0,7); }
 usageKey(org: string, metric: string) { return 'usage:' + org + ':' + this.period() + ':' + metric; }
 limits(tier: PlanTier): Record<string,number> { return (JSON.parse(this.config.get<string>('PLAN_LIMITS_JSON') || '{}') as Record<string,Record<string,number>>)[tier] || DEFAULT_LIMITS[tier]; }
 async trackUsage(org: string, metric: string, delta: number, eventId?: string) {
   if (!['students','courses','emails'].includes(metric) || !Number.isSafeInteger(delta) || delta < 0) throw new BadRequestException('Invalid usage increment');
   const key = this.usageKey(org, metric);
   if (eventId) return Number(await this.redis.eval("if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 7776000) then return redis.call('INCRBY', KEYS[1], ARGV[1]) else return tonumber(redis.call('GET', KEYS[1]) or '0') end", 2, key, key + ':event:' + eventId, delta));
   return this.redis.incrby(key, delta);
 }
 async usage(org: string) {
   const [students, courses, emails] = await Promise.all([this.db.count('student',org,{ deletedAt: null }),this.db.count('course',org,{ deletedAt: null }),this.redis.get(this.usageKey(org,'emails'))]);
   return { period: this.period(), students, courses, emails: Number(emails || 0) };
 }
 async subscription(org: string) { const organization = await this.db.require('organization',org,org); return { planTier: organization.planTier, subscription: await this.db.first('billingSubscription',org,{}), usage: await this.usage(org), limits: this.limits(organization.planTier) }; }
 async checkout(org: string, tier: PlanTier, requestId: string) {
   const prices = JSON.parse(this.config.get<string>('STRIPE_PRICE_IDS_JSON') || '{}') as Record<string,string>;
   if (!prices[tier]) throw new ServiceUnavailableException('Plan price not configured');
   const organization = await this.db.require('organization',org,org);
   let customer = organization.stripeCustomerId;
   if (!customer) {
     customer = (await this.stripe.request<{id:string}>('customers', { name: organization.name, 'metadata[organizationId]': org }, 'customer-' + org)).id;
     await this.db.update('organization',org,org,{ stripeCustomerId: customer });
   }
   const success = this.config.getOrThrow<string>('BILLING_SUCCESS_URL'), cancel = this.config.getOrThrow<string>('BILLING_CANCEL_URL');
   return this.stripe.request<{id:string;url:string}>('checkout/sessions', { customer, mode:'subscription', 'line_items[0][price]': prices[tier], 'line_items[0][quantity]':'1', success_url:success, cancel_url:cancel, client_reference_id:org, 'subscription_data[metadata][organizationId]':org }, org + '-' + requestId);
 }
 async portal(org: string) { const organization = await this.db.require('organization',org,org); if (!organization.stripeCustomerId) throw new BadRequestException('No billing customer'); return this.stripe.request<{url:string}>('billing_portal/sessions',{ customer:organization.stripeCustomerId, return_url:this.config.getOrThrow<string>('BILLING_RETURN_URL') }); }
 async invoices(org: string) { const organization = await this.db.require('organization',org,org); if (!organization.stripeCustomerId) return { data:[] }; return this.stripe.request('invoices?customer=' + encodeURIComponent(organization.stripeCustomerId) + '&limit=100'); }
}

