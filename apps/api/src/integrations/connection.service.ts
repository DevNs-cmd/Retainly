import { ProviderRegistry } from './provider-registry';
import { Injectable, NotFoundException } from '@nestjs/common'; import { DatabaseService } from '../data/database.service'; import { CredentialVault } from './credential-vault';
@Injectable() export class ConnectionService {
 constructor(private readonly db: DatabaseService, private readonly vault: CredentialVault,private readonly registry:ProviderRegistry) {}
 async load(org: string, provider: string) {
   const connection = await this.db.first('integrationConnection', org, { provider, status: 'CONNECTED' });
   if (!connection) throw new NotFoundException('Connected integration not found');
   let credentials=this.vault.decrypt(org,provider,connection.encryptedCredentials);
   if(credentials.expiresAt&&credentials.expiresAt<Date.now()+60000&&credentials.refreshToken){credentials={...credentials,...await this.registry.token(provider,undefined,credentials.refreshToken)};await this.db.update('integrationConnection',org,connection.id,{encryptedCredentials:this.vault.encrypt(org,provider,credentials)});}
   return {connection,credentials};
 }
}

