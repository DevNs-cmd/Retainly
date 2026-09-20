import { Injectable, ForbiddenException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { DatabaseService, Transaction } from '../data/database.service';
import { OutboxService } from '../outbox/outbox.service';
import { ProviderHttp } from '../integrations/provider-http.service';
import { AuthUser } from '../auth/auth.types';
import { Membership } from '../data/entities';
@Injectable()
export class InvitationService {
 constructor(private readonly db:DatabaseService,private readonly config:ConfigService,private readonly outbox:OutboxService,private readonly http:ProviderHttp){}
 private key(){const key=Buffer.from(this.config.get<string>('INVITATION_SIGNING_KEY')||'','base64');if(key.length<32)throw new ServiceUnavailableException('Invitation signing key not configured');return key;}
 async enqueue(member:Membership,tx:Transaction){
  const target=new URL(this.config.getOrThrow<string>('INVITATION_ACCEPT_URL'));if(target.protocol!=='https:')throw new ServiceUnavailableException('Invitation URL must use HTTPS');
  this.config.getOrThrow('SYSTEM_EMAIL_API_KEY');this.config.getOrThrow('SYSTEM_EMAIL_FROM');
  const token=await new SignJWT({org:member.organizationId,email:member.invitationEmail,version:member.updatedAt.toISOString()}).setProtectedHeader({alg:'HS256'}).setIssuer('retainly').setAudience('team-invitation').setSubject(member.id).setIssuedAt().setExpirationTime('7d').sign(this.key());
  target.searchParams.set('token',token);
  await this.outbox.create({organizationId:member.organizationId,eventType:'membership.invited',payload:{membershipId:member.id,to:member.invitationEmail,url:target.toString(),issuedAt:new Date().toISOString()}},tx);
 }
 async deliver(org:string,eventId:string,data:Record<string,unknown>){
  const member=await this.db.require('membership',org,String(data.membershipId));
  if(member.deletedAt||member.invitationStatus!=='PENDING')return;
  if(await this.db.first('consumerReceipt',org,{consumer:'invitation-delivery',eventId}))return;
  if(Date.now()-Date.parse(String(data.issuedAt))>23*3600000)throw new ConflictException('Invitation delivery window expired; reissue invitation');
  await this.http.request('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+this.config.getOrThrow('SYSTEM_EMAIL_API_KEY'),'content-type':'application/json','Idempotency-Key':eventId},body:JSON.stringify({from:this.config.getOrThrow('SYSTEM_EMAIL_FROM'),to:[data.to],subject:'Your Retainly team invitation',text:'You have been invited to a Retainly team. Sign in and accept within seven days: '+data.url})});
  await this.db.once(org,'invitation-delivery',eventId,async()=>undefined);
 }
 async accept(token:string,user:AuthUser){
  if(!user.emailVerified||!user.email)throw new ForbiddenException('A verified email claim is required');
  let claims;
  try {claims=(await jwtVerify(token,this.key(),{issuer:'retainly',audience:'team-invitation',algorithms:['HS256'],requiredClaims:['sub','exp','iat']})).payload;}catch{throw new ForbiddenException('Invitation is invalid or expired');}
  const org=claims.org;if(typeof org!=='string'||claims.email!==user.email.toLowerCase())throw new ForbiddenException('Invitation belongs to another email');
  return this.db.transaction(async tx=>{
   const organization=await this.db.require('organization',org,org,tx);if(organization.deletedAt)throw new ForbiddenException('Organization is inactive');
   const member=await this.db.require('membership',org,claims.sub!,tx);
   if(member.deletedAt)throw new ForbiddenException('Invitation revoked');
   if(member.invitationStatus==='ACCEPTED'&&member.userId===user.userId)return member;
   if(member.invitationStatus!=='PENDING'||member.invitationEmail!==claims.email||member.updatedAt.toISOString()!==claims.version)throw new ConflictException('Invitation is no longer valid');
   if(await this.db.first('membership',org,{userId:user.userId,deletedAt:null},tx))throw new ConflictException('Already a member');
   if(!await this.db.first('user',org,{id:user.userId},tx))await this.db.create('user',org,{id:user.userId,email:user.email,name:user.email!.split('@')[0]},tx);
   return this.db.update('membership',org,member.id,{userId:user.userId,invitationStatus:'ACCEPTED'},tx);
  });
 }
}
