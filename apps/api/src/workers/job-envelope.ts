import { Job } from 'bullmq';import { BadRequestException } from '@nestjs/common';import { createHash } from 'node:crypto';
export interface JobEnvelope { organizationId:string;eventId?:string;provider?:string;key?:string;cursor?:string;metric?:string;delta?:number;subscriptionId?:string;payload?:Record<string,unknown>; }
export function envelope(job:Job<JobEnvelope>){const data=job.data;if(!data?.organizationId)throw new BadRequestException('Job organization required');return {...data,eventId:data.eventId||job.id||'',payload:data.payload||{}};}
export function requiredString(data:Record<string,unknown>,key:string){if(typeof data[key]!=='string'||!data[key])throw new BadRequestException('Job field required: '+key);return data[key] as string;}
export function stableId(...parts:string[]){return createHash('sha256').update(JSON.stringify(parts)).digest('hex');}

