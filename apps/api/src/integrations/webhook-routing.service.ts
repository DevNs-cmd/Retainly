import { Injectable,UnauthorizedException,ServiceUnavailableException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { createHmac,timingSafeEqual } from 'node:crypto';
@Injectable()export class WebhookRoutingService{
 constructor(private readonly config:ConfigService){}
 private key(){const key=this.config.get<string>('WEBHOOK_ROUTING_KEY');if(!key||key.length<32)throw new ServiceUnavailableException('Webhook routing key not configured');return key;}
 token(org:string,provider:string){const payload=Buffer.from(JSON.stringify({org,provider})).toString('base64url');return payload+'.'+createHmac('sha256',this.key()).update(payload).digest('base64url');}
 verify(token:string,provider:string){try{const [payload,signature,...extra]=token.split('.');if(extra.length)throw new Error();const expected=createHmac('sha256',this.key()).update(payload).digest();const actual=Buffer.from(signature,'base64url');if(expected.length!==actual.length||!timingSafeEqual(expected,actual))throw new Error();const data=JSON.parse(Buffer.from(payload,'base64url').toString());if(data.provider!==provider||typeof data.org!=='string'||!data.org)throw new Error();return data.org as string;}catch{throw new UnauthorizedException('Invalid webhook endpoint');}}
 url(org:string,provider:string){return this.config.getOrThrow<string>('PUBLIC_API_URL').replace(/\/$/,'')+'/api/webhooks/'+provider+'?endpoint='+this.token(org,provider);}
}

