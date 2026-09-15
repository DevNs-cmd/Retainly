import { Injectable, ServiceUnavailableException } from '@nestjs/common'; import { ConfigService } from '@nestjs/config'; import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
export interface Credentials { apiKey?: string; accessToken?: string; refreshToken?: string; webhookSecret?: string; accountId?: string; from?: string; subdomain?: string; }
@Injectable() export class CredentialVault {
 constructor(private readonly config: ConfigService) {}
 private key() { const key = Buffer.from(this.config.get<string>('INTEGRATION_ENCRYPTION_KEY') || '', 'base64'); if (key.length !== 32) throw new ServiceUnavailableException('Integration encryption key is not configured'); return key; }
 encrypt(org: string, provider: string, credentials: Credentials) {
   const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', this.key(), iv); cipher.setAAD(Buffer.from(org + ':' + provider));
   const data = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
   return [iv, cipher.getAuthTag(), data].map(x => x.toString('base64')).join('.');
 }
 decrypt(org: string, provider: string, value: string): Credentials {
   try { const [iv, tag, data] = value.split('.').map(x => Buffer.from(x, 'base64')); const decipher = createDecipheriv('aes-256-gcm', this.key(), iv); decipher.setAAD(Buffer.from(org + ':' + provider)); decipher.setAuthTag(tag); return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')); }
   catch { throw new ServiceUnavailableException('Integration credentials unavailable'); }
 }
}

