import { Processor,WorkerHost,OnWorkerEvent } from '@nestjs/bullmq';import { Logger } from '@nestjs/common';import { Job } from 'bullmq';import { QueueNames } from '../../queues/queue-names';import { SyncProcessor } from './sync.processor';import { JobEnvelope } from '../job-envelope';
@Processor(QueueNames.SYNC,{concurrency:2})
export class SyncWorker extends WorkerHost{
 private readonly logger=new Logger(SyncWorker.name);
 constructor(private readonly processor:SyncProcessor){super();}
 process(job:Job<JobEnvelope>){return this.processor.process(job);}
 @OnWorkerEvent('completed')completed(job:Job){this.logger.log({jobId:job.id},'Job completed');}
 @OnWorkerEvent('failed')async failed(job:Job<JobEnvelope>|undefined){this.logger.error({jobId:job?.id},'Job failed');}
 @OnWorkerEvent('stalled')stalled(jobId:string){this.logger.warn({jobId},'Job stalled');}
}

