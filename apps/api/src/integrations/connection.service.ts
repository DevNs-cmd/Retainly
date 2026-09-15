import { Injectable, NotFoundException } from '@nestjs/common'; import { DatabaseService } from '../data/database.service'; import { CredentialVault } from './credential-vault';
@Injectable() export class ConnectionService {
 constructor(private readonly db: DatabaseService, private readonly vault: CredentialVault) {}
 async load(org: string, provider: string) {
   const connection = await this.db.first('integrationConnection', org, { provider, status: 'CONNECTED' });
   if (!connection) throw new NotFoundException('Connected integration not found');
   return { connection, credentials: this.vault.decrypt(org, provider, connection.encryptedCredentials) };
 }
}

