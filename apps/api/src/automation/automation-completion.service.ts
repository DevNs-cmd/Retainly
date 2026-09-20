import { Injectable } from '@nestjs/common';
import { DatabaseService, Transaction } from '../data/database.service';
/** Persist action acknowledgements so retries can finish an execution without repeating actions. */
@Injectable()
export class AutomationCompletionService {
 constructor(private readonly db:DatabaseService){}
 async complete(org:string,payload:Record<string,unknown>,failed=false){
  if(typeof payload.executionId!=='string'||typeof payload.actionId!=='string'||!Number.isInteger(payload.actionCount))return;
  await this.db.once(org,'automation-action',payload.actionId,async tx=>{
   const execution=await this.db.require('automationExecution',org,payload.executionId as string,tx);
   await this.db.create('consumerReceipt',org,{consumer:'execution-'+execution.id,eventId:payload.actionId as string,completedAt:new Date()},tx);
   const count=await this.db.count('consumerReceipt',org,{consumer:'execution-'+execution.id},tx);
   if(failed||execution.status==='FAILED')await this.db.update('automationExecution',org,execution.id,{status:'FAILED'},tx);
   else if(count>=Number(payload.actionCount))await this.db.update('automationExecution',org,execution.id,{status:'COMPLETED'},tx);
  });
 }
}
