import { Module } from '@nestjs/common';import { WebhooksController } from './controllers/webhooks.controller';import { SignatureVerifier } from './verification/signature-verifier';import { WebhookIdempotencyService } from './idempotency/webhook-idempotency.service';import { ProviderNormalizer } from './normalizers/provider-normalizer';
@Module({controllers:[WebhooksController],providers:[SignatureVerifier,WebhookIdempotencyService,ProviderNormalizer],exports:[WebhookIdempotencyService]})export class WebhooksModule{}

