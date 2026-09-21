import { Controller,Post,Param,Req,Query,HttpCode,RawBodyRequest,UnauthorizedException,ConflictException } from '@nestjs/common';import { Request } from 'express';import { InjectQueue } from '@nestjs/bullmq';import { Queue } from 'bullmq';import { Throttle } from '@nestjs/throttler';import { ApiTags,ApiOperation,ApiResponse } from '@nestjs/swagger';
import { Public } from '../../auth/auth.decorators';import { QueueNames } from '../../queues/queue-names';import { SignatureVerifier } from '../verification/signature-verifier';import { WebhookIdempotencyService } from '../idempotency/webhook-idempotency.service';import { ProviderNormalizer } from '../normalizers/provider-normalizer';import { WebhookRoutingService } from '../../integrations/webhook-routing.service';import { ConnectionService } from '../../integrations/connection.service';import { withTimeout } from '../../common/utils/with-timeout';import { ProviderRegistry } from '../../integrations/provider-registry';
@ApiTags('webhooks') @Controller('webhooks')export class WebhooksController{
 constructor(private readonly signatures:SignatureVerifier,private readonly idempotency:WebhookIdempotencyService,private readonly normalizer:ProviderNormalizer,private readonly routing:WebhookRoutingService,private readonly connections:ConnectionService,private readonly providers:ProviderRegistry,@InjectQueue(QueueNames.WEBHOOK)private readonly queue:Queue){}
 @Public() @Post(':provider') @HttpCode(202) @Throttle({default:{limit:1000,ttl:60000}}) @ApiOperation({summary:'Verify and queue provider events'}) @ApiResponse({status:202,description:'Accepted after signature verification'})
 async handleWebhook(@Param('provider')provider:string,@Query('endpoint')endpoint:string,@Req()request:RawBodyRequest<Request>){
   this.providers.assert(provider);const org=this.routing.verify(endpoint||'',provider);const {credentials}=await this.connections.load(org,provider);
   if(!request.rawBody||!credentials.webhookSecret)throw new UnauthorizedException('Webhook signing secret required');
   const header=(name:string)=>typeof request.headers[name]==='string'?request.headers[name] as string:'';
   if(provider==='stripe')this.signatures.verifyStripe(request.rawBody,header('stripe-signature'),credentials.webhookSecret);
   else if(provider==='thinkific')this.signatures.verifyRawSha256(request.rawBody,header('x-thinkific-hmac-sha256'),credentials.webhookSecret);
   else if(provider==='mailchimp'&&header('x-mandrill-signature'))this.signatures.verifyMandrill(this.routing.url(org,provider),request.body,header('x-mandrill-signature'),credentials.webhookSecret);
   else this.signatures.verifyStripe(request.rawBody,header(provider==='mailchimp'?'x-mailchimp-signature':'x-retainly-signature'),credentials.webhookSecret);
   const normalized=this.normalizer.normalize(provider,request.body,request.rawBody);
   for(const event of normalized){
    const key=this.idempotency.key(org,provider,event.eventId);if(await this.idempotency.isProcessed(key))continue;
    const token=await this.idempotency.acquire(key);if(!token)throw new ConflictException('Webhook acceptance in progress; retry');
    try{const jobId=key.slice(8);const existing=await withTimeout(this.queue.getJob(jobId));if(existing&&await withTimeout(existing.getState())==='failed')throw new ConflictException('Failed webhook requires operator retry');await withTimeout(this.queue.add('PROCESS_WEBHOOK',{organizationId:org,provider,eventId:event.eventId,normalized:event,idempotencyKey:key},{jobId,removeOnComplete:false,removeOnFail:false}));}
    finally{await this.idempotency.release(key,token);}
   }
   return {received:true,count:normalized.length};
 }
}

