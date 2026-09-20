import { Injectable, NotFoundException } from '@nestjs/common'; import { DatabaseService } from '../data/database.service'; import { ConnectionService } from '../integrations/connection.service'; import { ProviderRegistry } from '../integrations/provider-registry'; import { ResourceQueryDto } from '../common/dto/resource-query.dto';
@Injectable() export class NotificationService {
 constructor(private readonly db:DatabaseService,private readonly connections:ConnectionService,private readonly providers:ProviderRegistry) {}
 async list(org:string,userId:string,q:ResourceQueryDto){const where={userId,dismissedAt:null};return {data:await this.db.list('notification',org,where,{skip:q.skip,take:q.limit,orderBy:{createdAt:'desc'}}),total:await this.db.count('notification',org,where),page:q.page,limit:q.limit};}
 async mark(org:string,userId:string,id:string,dismiss=false){const row=await this.db.first('notification',org,{id,userId});if(!row)throw new NotFoundException('Notification not found');return this.db.update('notification',org,id,dismiss?{dismissedAt:new Date()}:{readAt:new Date()});}
 async sendEmail(org:string,to:string,templateId:string,data:Record<string,unknown>,key:string){
   const connection=await this.db.first('integrationConnection',org,{provider:{in:['mailchimp','convertkit','activecampaign','klaviyo']},status:'CONNECTED'});
   if(!connection)throw new NotFoundException('Email integration not connected');
   const {credentials}=await this.connections.load(org,connection.provider);
   return this.providers.sendEmail(connection.provider,credentials,to,templateId,data,key);
 }
 async sendSms(org:string,to:string,message:string,key:string){const {credentials}=await this.connections.load(org,'twilio');return this.providers.sendSms(credentials,to,message,key);}
 async sendSlack(org:string,channelId:string,message:string,key:string){const {credentials}=await this.connections.load(org,'slack');return this.providers.sendSlack(credentials,channelId,message,key);}
 async ownerAlert(org:string,title:string,message:string,eventId:string){
   return this.db.once(org,'owner-alert',eventId,async tx=>{
     const owners=await this.db.list('membership',org,{role:'OWNER' as never,deletedAt:null}, {},tx);
     for(const owner of owners)if(owner.userId)await this.db.create('notification',org,{userId:owner.userId,title,message,sourceEventId:eventId,readAt:null,dismissedAt:null},tx);
   });
 }
}

