import { WebhookRoutingService } from './webhook-routing.service';
import { Global, Module } from '@nestjs/common'; import { ProviderHttp } from './provider-http.service'; import { ProviderRegistry } from './provider-registry'; import { CredentialVault } from './credential-vault'; import { ConnectionService } from './connection.service'; import { StripeAdapter } from './payments/stripe/stripe.adapter'; import { IntegrationsService } from './integrations.service'; import { IntegrationsRepository } from './integrations.repository'; import { IntegrationsController } from './integrations.controller';
@Global() @Module({ providers: [WebhookRoutingService,ProviderHttp, ProviderRegistry, CredentialVault, ConnectionService, StripeAdapter, IntegrationsRepository, IntegrationsService], controllers: [IntegrationsController], exports: [WebhookRoutingService,ProviderHttp, ProviderRegistry, CredentialVault, ConnectionService, StripeAdapter] }) export class IntegrationsModule {}


