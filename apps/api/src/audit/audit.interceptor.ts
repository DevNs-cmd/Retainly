import { Injectable,NestInterceptor,ExecutionContext,CallHandler,Logger } from '@nestjs/common'; import { mergeMap } from 'rxjs';import { AuditService } from './audit.service';
@Injectable() export class AuditInterceptor implements NestInterceptor {
 constructor(private readonly audit:AuditService){}
 intercept(ctx:ExecutionContext,next:CallHandler){
   const req=ctx.switchToHttp().getRequest();
   if(!req.user||!['POST','PATCH','DELETE'].includes(req.method))return next.handle();
   return next.handle().pipe(mergeMap(async result=>{
     try { await this.audit.log(req.method,req.user.userId,req.user.organizationId,req.route?.path||'resource',req.params.id||result?.id||'',{ changedFields:Object.keys(req.body||{}).filter(k=>!['credentials','code','state','apiKey','accessToken','refreshToken'].includes(k)) }); }
     catch { new Logger(AuditInterceptor.name).error({organizationId:req.user.organizationId,requestId:req.id},'Audit persistence failed after successful mutation'); }
     return result;
   }));
 }
}

