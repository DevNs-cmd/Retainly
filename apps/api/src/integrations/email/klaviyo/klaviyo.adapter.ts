import { IEmailProvider } from '../email-provider.interface';
export class KlaviyoAdapter implements IEmailProvider { async sendEmail() { return true; } }
