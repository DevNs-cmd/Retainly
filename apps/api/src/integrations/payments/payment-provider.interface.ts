export interface IPaymentProvider { getSubscription(id: string): Promise<any>; }
