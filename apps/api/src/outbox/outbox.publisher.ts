import { withTimeout } from '../common/utils/with-timeout';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueNames } from '../queues/queue-names';
import { OutboxRepository } from './outbox.repository';
export const EVENT_ROUTES: Record<string, QueueNames[]> = {
  'course.synced': [QueueNames.ANALYTICS],
  'student.synced': [QueueNames.RISK, QueueNames.ANALYTICS],
  'payment.recorded': [QueueNames.ANALYTICS],
  'billing.subscription.changed': [QueueNames.BILLING],
  'student.activity.recorded': [QueueNames.RISK, QueueNames.ANALYTICS],
  'automation.evaluate': [QueueNames.AUTOMATION],
  'automation.action.requested': [QueueNames.NOTIFICATION],
  'notification.send': [QueueNames.NOTIFICATION],
  'risk.score.updated': [QueueNames.AUTOMATION],
  'payment.failed': [QueueNames.AUTOMATION, QueueNames.NOTIFICATION],
  'enrollment.status.changed': [QueueNames.RISK, QueueNames.AUTOMATION],
  'campaign.scheduled': [QueueNames.NOTIFICATION],
};
@Injectable()
export class OutboxPublisher {
  private readonly logger = new Logger(OutboxPublisher.name);
  private running = false;
  private readonly queues: Partial<Record<QueueNames, Queue>>;
  constructor(private readonly repository: OutboxRepository,
    @InjectQueue(QueueNames.RISK) risk: Queue,
    @InjectQueue(QueueNames.ANALYTICS) analytics: Queue,
    @InjectQueue(QueueNames.AUTOMATION) automation: Queue,
    @InjectQueue(QueueNames.NOTIFICATION) notification: Queue,
    @InjectQueue(QueueNames.BILLING) billing: Queue,
  ) { this.queues = { [QueueNames.BILLING]: billing, [QueueNames.RISK]: risk, [QueueNames.ANALYTICS]: analytics, [QueueNames.AUTOMATION]: automation, [QueueNames.NOTIFICATION]: notification }; }
  @Cron('*/5 * * * * *')
  async publishPendingEvents() {
    if (this.running) return;
    this.running = true;
    try {
      await this.repository.withUnpublished(25, async (events, tx) => {
        const deadline = Date.now() + 20000;
        for (const event of events) {
          if (Date.now() >= deadline) break;
          try {
            const destinations = EVENT_ROUTES[event.eventType];
            if (!destinations?.length) throw new Error('No event route');
            for (const destination of destinations) {
              // BullMQ add is atomic by jobId. Retain jobs so replays after a DB rollback deduplicate.
              const queue = this.queues[destination];
              if (!queue) throw new Error('Queue not registered');
              await withTimeout(queue.add(event.eventType, {
                eventId: event.id, organizationId: event.organizationId, payload: event.payload,
              }, { delay: event.eventType === 'campaign.scheduled' ? Math.max(0, new Date((event.payload as { scheduledAt: string }).scheduledAt).getTime() - Date.now()) : 0, jobId: event.id, removeOnComplete: false, removeOnFail: false }));
            }
          } catch {
            await this.repository.markFailed(event, tx);
            this.logger.warn({ eventId: event.id, organizationId: event.organizationId }, 'Outbox delivery failed');
            continue;
          }
          await this.repository.markPublished(event.organizationId, [event.id], tx);
        }
      });
    } catch { this.logger.error('Outbox polling failed; pending events will retry'); }
    finally { this.running = false; }
  }
}


