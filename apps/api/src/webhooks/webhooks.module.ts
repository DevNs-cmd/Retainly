import { Module } from '@nestjs/common';
import { WebhooksController } from './controllers/webhooks.controller';
import { SignatureVerifier } from './verification/signature-verifier';
import { WebhookIdempotencyService } from './idempotency/webhook-idempotency.service';
import { WebhookProcessorService } from './processors/webhook-processor.service';

@Module({
  controllers: [WebhooksController],
  providers: [SignatureVerifier, WebhookIdempotencyService, WebhookProcessorService],
})
export class WebhooksModule {}
