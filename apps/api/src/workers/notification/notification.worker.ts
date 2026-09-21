import { Processor,WorkerHost,OnWorkerEvent } from '@nestjs/bullmq';import { Logger } from '@nestjs/common';import { Job } from 'bullmq';import { QueueNames } from '../../queues/queue-names';import { NotificationProcessor } from './notification.processor';import { JobEnvelope } from '../job-envelope';
@Processor(QueueNames.NOTIFICATION,{concurrency:5})
export class NotificationWorker extends WorkerHost{
 private readonly logger=new Logger(NotificationWorker.name);
 constructor(private readonly processor:NotificationProcessor){super();}
 process(job:Job<JobEnvelope>){return this.processor.process(job);}
 @OnWorkerEvent('completed')completed(job:Job){this.logger.log({jobId:job.id},'Job completed');}
 @OnWorkerEvent('failed')async failed(job:Job<JobEnvelope>|undefined){this.logger.error({jobId:job?.id},'Job failed');if(job)try{await this.processor.failed(job);}catch{this.logger.error('Delivery failure alert could not be recorded');}}
 @OnWorkerEvent('stalled')stalled(jobId:string){this.logger.warn({jobId},'Job stalled');}
}

