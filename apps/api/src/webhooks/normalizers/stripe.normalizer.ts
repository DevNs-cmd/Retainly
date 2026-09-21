import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ActivityType, CreateActivityDto } from '../../activities/dto/create-activity.dto';
export interface StripeEvent {
  id: string; type: string; created: number;
  data: { object: { id: string; metadata?: Record<string, string> } };
}
@Injectable()
export class StripeNormalizer {
  normalize(event: StripeEvent): CreateActivityDto {
    const types: Record<string, ActivityType> = {
      'payment_intent.succeeded': ActivityType.PAYMENT_MADE,
      'payment_intent.payment_failed': ActivityType.PAYMENT_FAILED,
      'invoice.payment_failed': ActivityType.PAYMENT_FAILED,
      'invoice.paid': ActivityType.PAYMENT_MADE,
    };
    const activityType = types[event?.type];
    if (!activityType) throw new UnprocessableEntityException('Unsupported Stripe event type');
    const studentId = event.data?.object?.metadata?.studentId;
    if (!event.id || typeof event.id !== 'string' || event.id.length > 255 ||
        typeof studentId !== 'string' || !studentId || studentId.length > 128 ||
        typeof event.data?.object?.id !== 'string' || !Number.isSafeInteger(event.created) ||
        !Number.isFinite(new Date(event.created * 1000).getTime())) throw new BadRequestException('Invalid Stripe activity event');
    return { studentId, activityType, source: 'stripe',
      payload: { providerEventId: event.id, providerObjectId: event.data.object.id },
      occurredAt: new Date(event.created * 1000).toISOString() };
  }
}
