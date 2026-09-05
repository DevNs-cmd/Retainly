import { IPaymentProvider } from '../payment-provider.interface';
export class StripeAdapter implements IPaymentProvider { async getSubscription(id: string) { return {}; } }
