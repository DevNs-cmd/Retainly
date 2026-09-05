import { Controller, Post } from '@nestjs/common';
@Controller('webhooks')
export class WebhooksController {
  @Post(':provider')
  async handleWebhook() { return { received: true }; }
}
