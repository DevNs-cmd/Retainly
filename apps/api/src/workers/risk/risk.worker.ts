import { Processor,WorkerHost,OnWorkerEvent } from '@nestjs/bullmq';import { Logger } from '@nestjs/common';import { Job } from 'bullmq';import { QueueNames } from '../../queues/queue-names';import { RiskProcessor } from './risk.processor';import { JobEnvelope } from '../job-envelope';
@Processor(QueueNames.RISK,{concurrency:5})
export class RiskWorker extends WorkerHost{
 private readonly logger=new Logger(RiskWorker.name);
 constructor(private readonly processor:RiskProcessor){super();}
 process(job:Job<JobEnvelope>){return this.processor.process(job);}
 @OnWorkerEvent('completed')completed(job:Job){this.logger.log({jobId:job.id},'Job completed');}
 @OnWorkerEvent('failed')async failed(job:Job<JobEnvelope>|undefined){this.logger.error({jobId:job?.id},'Job failed');}
 @OnWorkerEvent('stalled')stalled(jobId:string){this.logger.warn({jobId},'Job stalled');}
}

