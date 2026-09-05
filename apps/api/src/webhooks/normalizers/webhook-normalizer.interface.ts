export interface IWebhookNormalizer<T = any> { normalize(rawEvent: any): T; }
