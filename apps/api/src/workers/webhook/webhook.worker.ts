import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueNames } from '../../queues/queue-names';
import { WebhookProcessor } from './webhook.processor';
import { WebhookJobData } from './webhook.jobs';
@Processor(QueueNames.WEBHOOK, { concurrency: 5 })
export class WebhookWorker extends WorkerHost {
  private readonly logger = new Logger(WebhookWorker.name);
  constructor(private readonly processor: WebhookProcessor) { super(); }
  async process(job: Job<WebhookJobData>) {
    if (job.name !== 'PROCESS_WEBHOOK') throw new Error('Unsupported webhook job');
    await this.processor.process(job.data);
  }
  @OnWorkerEvent('completed') completed(job: Job) { this.logger.log({ jobId: job.id }, 'Job completed'); }
  @OnWorkerEvent('failed') failed(job: Job | undefined) { this.logger.error({ jobId: job?.id }, 'Job failed'); }
  @OnWorkerEvent('stalled') stalled(jobId: string) { this.logger.warn({ jobId }, 'Job stalled'); }
}
