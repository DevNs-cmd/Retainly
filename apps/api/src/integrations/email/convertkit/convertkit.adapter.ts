import { IEmailProvider } from '../email-provider.interface';
export class ConvertKitAdapter implements IEmailProvider { async sendEmail() { return true; } }
