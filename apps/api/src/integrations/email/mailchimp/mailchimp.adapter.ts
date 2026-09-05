import { IEmailProvider } from '../email-provider.interface';
export class MailchimpAdapter implements IEmailProvider { async sendEmail() { return true; } }
