import { Processor,WorkerHost,OnWorkerEvent } from '@nestjs/bullmq';import { Logger } from '@nestjs/common';import { Job } from 'bullmq';import { QueueNames } from '../../queues/queue-names';import { AutomationProcessor } from './automation.processor';import { JobEnvelope } from '../job-envelope';
@Processor(QueueNames.AUTOMATION,{concurrency:2})
export class AutomationWorker extends WorkerHost{
 private readonly logger=new Logger(AutomationWorker.name);
 constructor(private readonly processor:AutomationProcessor){super();}
 process(job:Job<JobEnvelope>){return this.processor.process(job);}
 @OnWorkerEvent('completed')completed(job:Job){this.logger.log({jobId:job.id},'Job completed');}
 @OnWorkerEvent('failed')async failed(job:Job<JobEnvelope>|undefined){this.logger.error({jobId:job?.id},'Job failed');}
 @OnWorkerEvent('stalled')stalled(jobId:string){this.logger.warn({jobId},'Job stalled');}
}

