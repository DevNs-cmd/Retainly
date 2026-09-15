import { Injectable,BadRequestException } from '@nestjs/common';import { DatabaseService,Transaction } from '../data/database.service';import { TenantCache } from '../common/cache/tenant-cache.service';import { ResourceService } from '../common/resource.service';import { AutomationRepository } from './automation.repository';import { AutomationRule,TriggerType,ActionType } from '../data/entities';
@Injectable()export class AutomationService extends ResourceService<'automationRule'>{
 constructor(repository:AutomationRepository,db:DatabaseService,cache:TenantCache){super(repository,db,cache);}
 protected async validate(data:Partial<AutomationRule>,tx?:Transaction){
   await super.validate(data,tx);
   if(data.trigger){
     const required:Partial<Record<TriggerType,string>>={RISK_SCORE_ABOVE:'threshold',RISK_SCORE_CHANGE:'delta',INACTIVITY_DAYS:'days',ENROLLMENT_STATUS:'status'};
     const field=required[data.trigger.type];
     if(!data.trigger.conditions || (field && (data.trigger.conditions as Record<string,unknown>)[field]===undefined))throw new BadRequestException('Trigger condition missing: '+field);
   }
   const fields:Record<ActionType,string[]>={SEND_EMAIL:['templateId'],SEND_SMS:['message'],SEND_SLACK:['channelId','message'],ADD_TO_CAMPAIGN:['campaignId'],ASSIGN_COACH_TASK:['coachId','title'],MARK_REVIEWED:[],WEBHOOK:['endpointKey']};
   for(const action of data.actions||[]){
     if(!action.config||fields[action.type].some(key=>!(action.config as Record<string,unknown>)[key]))throw new BadRequestException('Action configuration incomplete');
     if(action.config.campaignId)await this.db.require('campaign',this.repository.organizationId,action.config.campaignId,tx);
     if(action.config.coachId)await this.db.require('user',this.repository.organizationId,action.config.coachId,tx);
   }
 }
}

