import { IEmailProvider } from '../email-provider.interface';
export class ActiveCampaignAdapter implements IEmailProvider { async sendEmail() { return true; } }
