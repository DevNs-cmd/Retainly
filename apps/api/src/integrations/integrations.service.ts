import { WebhookRoutingService } from './webhook-routing.service';
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'; import { randomUUID } from 'node:crypto'; import { InjectQueue } from '@nestjs/bullmq'; import { Queue } from 'bullmq';
import { DatabaseService } from '../data/database.service'; import { TenantContext } from '../tenant/tenant.context'; import { QueueNames } from '../queues/queue-names'; import { RedisService } from '../redis/redis.module';
import { CredentialVault, Credentials } from './credential-vault'; import { ProviderRegistry } from './provider-registry'; import { ConnectIntegrationDto } from './dto/integration.dto'; import { IntegrationConnection } from '../data/entities'; import { withTimeout } from '../common/utils/with-timeout';
@Injectable() export class IntegrationsService {
 constructor(private readonly routing: WebhookRoutingService, private readonly db: DatabaseService, private readonly tenant: TenantContext, private readonly vault: CredentialVault, private readonly registry: ProviderRegistry, private readonly redis: RedisService, @InjectQueue(QueueNames.SYNC) private readonly queue: Queue) {}
 private public(connection: IntegrationConnection) { const { encryptedCredentials, ...safe } = connection; return safe; }
 async list() { return (await this.db.list('integrationConnection', this.tenant.organizationId)).map(row => this.public(row)); }
 async get(provider: string) { this.registry.assert(provider); const row = await this.db.first('integrationConnection', this.tenant.organizationId, { provider }); return row ? this.public(row) : { provider, status: 'DISCONNECTED' }; }
 async connect(provider: string, dto: ConnectIntegrationDto) {
   this.registry.assert(provider); const org = this.tenant.organizationId;
   let credentials: Credentials | undefined = dto.credentials;
   if (dto.code) {
     if (!dto.state) throw new BadRequestException('OAuth state required');
     const expected = JSON.stringify({ org, provider, user: this.tenant.userId });
     const accepted = await this.redis.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", 1, 'oauth:' + dto.state, expected);
     if (!accepted) throw new ForbiddenException('OAuth state invalid or expired');
     credentials = await this.registry.bridgeCall<Credentials>(provider, 'oauth/token', { code: dto.code });
   }
   if (!credentials) {
     const state = randomUUID(); await this.redis.set('oauth:' + state, JSON.stringify({ org, provider, user: this.tenant.userId }), 'EX', 600);
     return this.registry.bridgeCall<{ authorizationUrl: string }>(provider, 'oauth/authorize', { state });
   }
   if (!credentials.apiKey && !credentials.accessToken) throw new BadRequestException('API key or access token required');
   const encryptedCredentials = this.vault.encrypt(org, provider, credentials);
   const row = await this.db.transaction(async tx => {
     const existing = await this.db.first('integrationConnection', org, { provider }, tx);
     return existing ? this.db.update('integrationConnection', org, existing.id, { encryptedCredentials, status: 'CONNECTED' }, tx) :
       this.db.create('integrationConnection', org, { provider, encryptedCredentials, config: {}, status: 'CONNECTED' }, tx);
   });
   return { ...this.public(row), webhookUrl: this.routing.url(org, provider) };
 }
 async disconnect(provider: string) {
   this.registry.assert(provider); const row = await this.db.first('integrationConnection', this.tenant.organizationId, { provider });
   if (!row) return { disconnected: true };
   await this.db.update('integrationConnection', this.tenant.organizationId, row.id, { status: 'DISCONNECTED', encryptedCredentials: '' });
   return { disconnected: true };
 }
 async sync(provider: string) {
   this.registry.assert(provider); const connection = await this.db.first('integrationConnection', this.tenant.organizationId, { provider, status: 'CONNECTED' });
   if (!connection) throw new BadRequestException('Integration is not connected');
   const jobs = ['stripe','paypal'].includes(provider) ? ['SYNC_PAYMENTS'] : ['SYNC_COURSES','SYNC_STUDENTS','SYNC_ENROLLMENTS'];
   for (const name of jobs) await withTimeout(this.queue.add(name, { organizationId: this.tenant.organizationId, provider }));
   return { queued: jobs };
 }
}


