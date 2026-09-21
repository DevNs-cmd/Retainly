import { Processor,WorkerHost,OnWorkerEvent } from '@nestjs/bullmq';import { Logger } from '@nestjs/common';import { Job } from 'bullmq';import { QueueNames } from '../../queues/queue-names';import { BillingProcessor } from './billing.processor';import { JobEnvelope } from '../job-envelope';
@Processor(QueueNames.BILLING,{concurrency:2})
export class BillingWorker extends WorkerHost{
 private readonly logger=new Logger(BillingWorker.name);
 constructor(private readonly processor:BillingProcessor){super();}
 process(job:Job<JobEnvelope>){return this.processor.process(job);}
 @OnWorkerEvent('completed')completed(job:Job){this.logger.log({jobId:job.id},'Job completed');}
 @OnWorkerEvent('failed')async failed(job:Job<JobEnvelope>|undefined){this.logger.error({jobId:job?.id},'Job failed');}
 @OnWorkerEvent('stalled')stalled(jobId:string){this.logger.warn({jobId},'Job stalled');}
}

