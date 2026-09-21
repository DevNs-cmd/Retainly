import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService, Transaction } from '../data/database.service';
import { TenantCache } from '../common/cache/tenant-cache.service';
import { ResourceService } from '../common/resource.service';
import { SubscriptionsRepository } from './subscriptions.repository';
import { Subscription, EnrollmentStatus } from '../data/entities';
import { OutboxService } from '../outbox/outbox.service';
@Injectable()
export class SubscriptionsService extends ResourceService<'subscription'> {
 constructor(repository:SubscriptionsRepository,db:DatabaseService,cache:TenantCache,private readonly outbox:OutboxService){super(repository,db,cache);}
 protected async validate(data:Partial<Subscription>,tx?:Transaction){await super.validate(data,tx);if(data.currentPeriodStart&&data.currentPeriodEnd&&data.currentPeriodStart>=data.currentPeriodEnd)throw new BadRequestException('Subscription period end must follow start');}
 async update(id:string,data:Partial<Subscription>){
  const result=await this.db.transaction(async tx=>{
   const current=await this.db.require('subscription',this.repository.organizationId,id,tx);
   if(['studentId','provider','externalId'].some(k=>(data as Record<string,unknown>)[k]!==undefined&&(data as Record<string,unknown>)[k]!== (current as unknown as Record<string,unknown>)[k]))throw new BadRequestException('Subscription identity is immutable');
   if([EnrollmentStatus.CANCELLED,EnrollmentStatus.EXPIRED].includes(current.status)&&data.status&&data.status!==current.status)throw new ConflictException('A terminal subscription cannot be reactivated');
   const merged={...current,...data};await this.validate(merged,tx);
   const row=await this.repository.update(id,{...data,...(data.status===EnrollmentStatus.CANCELLED?{cancelledAt:current.cancelledAt||new Date()}:{})},tx);
   if(row.status!==current.status)await this.outbox.create({organizationId:this.repository.organizationId,eventType:'subscription.status.changed',payload:{studentId:row.studentId,subscriptionId:id,status:row.status}},tx);
   return row;
  });await this.cache.invalidate(this.repository.organizationId);return result;
 }
 // Cancels the local record; cancellation of provider billing is an explicit separate operation.
 async remove(id:string){await this.update(id,{status:EnrollmentStatus.CANCELLED});return {deleted:true};}
}
