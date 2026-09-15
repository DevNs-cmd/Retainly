import { Injectable,BadRequestException,ConflictException } from '@nestjs/common';import { DatabaseService } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { CampaignsRepository } from './campaigns.repository';import { Campaign,CampaignStatus } from '../data/entities';import { OutboxService } from '../outbox/outbox.service';import { ScheduleCampaignDto } from './dto/schedule-campaign.dto';
@Injectable()export class CampaignsService extends ResourceService<'campaign'>{
 constructor(repository:CampaignsRepository,db:DatabaseService,cache:TenantCache,private readonly outbox:OutboxService){super(repository,db,cache);}
 async get(id:string){const campaign=await super.get(id);const org=this.repository.organizationId;return {...campaign,stats:{sent:await this.db.count('campaignRecipient',org,{campaignId:id,status:'SENT'}),opened:await this.db.count('campaignRecipient',org,{campaignId:id,openedAt:{not:null}}),converted:await this.db.count('campaignRecipient',org,{campaignId:id,convertedAt:{not:null}})}};}
 async update(id:string,data:Partial<Campaign>){const current=await this.get(id);if(current.status===CampaignStatus.RUNNING)throw new ConflictException('Running campaigns cannot be edited');return super.update(id,data);}
 async remove(id:string){return this.repository.update(id,{archivedAt:new Date(),status:CampaignStatus.PAUSED});}
 async schedule(id:string,dto?:ScheduleCampaignDto){
   const when=dto?.scheduledAt||new Date();
   if(dto&&when.getTime()<=Date.now())throw new BadRequestException('Schedule must be in the future');
   return this.db.transaction(async tx=>{
     const current=await this.db.require('campaign',this.repository.organizationId,id,tx);
     if(current.archivedAt||[CampaignStatus.RUNNING,CampaignStatus.COMPLETED].includes(current.status))throw new ConflictException('Campaign cannot be sent in its current state');
     const row=await this.repository.update(id,{status:CampaignStatus.SCHEDULED,scheduledAt:when},tx);
     await this.outbox.create({organizationId:this.repository.organizationId,eventType:'campaign.scheduled',payload:{campaignId:id,scheduledAt:when.toISOString()}},tx);
     return row;
   });
 }
}

