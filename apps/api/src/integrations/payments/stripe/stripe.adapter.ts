import { Injectable, ServiceUnavailableException } from '@nestjs/common'; import { ConfigService } from '@nestjs/config'; import { ProviderHttp } from '../../provider-http.service';
export interface StripeSubscription { id: string; status: string; customer: string; current_period_end: number; items: { data: Array<{ price: { id: string } }> }; }
@Injectable() export class StripeAdapter {
 constructor(private readonly http: ProviderHttp, private readonly config: ConfigService) {}
 request<T>(path: string, data?: Record<string,string>, idempotencyKey?: string, token?: string): Promise<T> {
   const key = token || this.config.get<string>('STRIPE_SECRET_KEY'); if (!key) throw new ServiceUnavailableException('Stripe credentials not configured');
   return this.http.request<T>('https://api.stripe.com/v1/' + path, { method: data ? 'POST' : 'GET',
     headers: { authorization: 'Bearer ' + key, ...(data ? { 'content-type': 'application/x-www-form-urlencoded' } : {}), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, body: data ? new URLSearchParams(data) : undefined });
 }
 getSubscription(id: string) { return this.request<StripeSubscription>('subscriptions/' + encodeURIComponent(id)); }
}

