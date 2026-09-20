import { Injectable,BadRequestException,PayloadTooLargeException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { InjectQueue } from '@nestjs/bullmq';import { Queue } from 'bullmq';import { S3Client,GetObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';import { Upload } from '@aws-sdk/lib-storage';import { randomUUID } from 'node:crypto';import { Readable,Transform } from 'node:stream';import { parse } from 'csv-parse';import { isEmail } from 'class-validator';
import { QueueNames } from '../queues/queue-names';import { DatabaseService } from '../data/database.service';import { Segment } from '../data/entities';import { withTimeout } from '../common/utils/with-timeout';
@Injectable()export class StudentImportService{
 private readonly s3:S3Client;
 constructor(private readonly config:ConfigService,private readonly db:DatabaseService,@InjectQueue(QueueNames.SYNC)private readonly queue:Queue){this.s3=new S3Client({region:config.get<string>('AWS_REGION')||'us-east-1'});}
 async upload(org:string,body:Readable){
   const bucket=this.config.getOrThrow<string>('IMPORT_BUCKET');const id=randomUUID();const key=org+'/imports/'+id+'.csv';let bytes=0;
   const limit=new Transform({transform(chunk,encoding,callback){bytes+=chunk.length;if(bytes>10*1024*1024)callback(new PayloadTooLargeException('CSV exceeds 10 MB'));else callback(null,chunk);}});
   body.on('error',error=>limit.destroy(error));body.pipe(limit);
   await new Upload({client:this.s3,params:{Bucket:bucket,Key:key,Body:limit,ContentType:'text/csv',ServerSideEncryption:'AES256'},leavePartsOnError:false}).done();
   try{await withTimeout(this.queue.add('IMPORT_STUDENTS',{organizationId:org,eventId:id,key},{jobId:id}));}
   catch(error){throw error;} // Preserve object for operator recovery if Redis acceptance is uncertain.
   return {jobId:id,key,queued:true};
 }
 async process(org:string,key:string){
   if(!key.startsWith(org+'/imports/')||!key.endsWith('.csv'))throw new BadRequestException('Invalid import object key');
   const response=await this.s3.send(new GetObjectCommand({Bucket:this.config.getOrThrow<string>('IMPORT_BUCKET'),Key:key}));
   if(!response.Body)throw new BadRequestException('Import object not found');
   const parser=(response.Body as Readable).pipe(parse({columns:true,bom:true,skip_empty_lines:true,trim:true,max_record_size:65536}));
   let imported=0;const errors:Array<{row:number;message:string}>=[];
   for await(const value of parser){
     const row=value as Record<string,string>;const index=imported+errors.length+1;
     if(!row.name||!isEmail(row.email||'')){errors.push({row:index,message:'name and valid email required'});continue;}
     await this.db.transaction(async tx=>{const existing=await this.db.first('student',org,{email:row.email.toLowerCase(),deletedAt:null},tx);const data={name:row.name,email:row.email.toLowerCase(),phone:row.phone||null};if(existing)await this.db.update('student',org,existing.id,data,tx);else await this.db.create('student',org,{...data,segment:null,riskScore:null,deletedAt:null},tx);});
     imported++;
   }
   return {imported,errors};
 }
}


