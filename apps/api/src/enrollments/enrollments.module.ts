import { OutboxModule } from '../outbox/outbox.module';
import { Module } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
@Module({ imports: [OutboxModule], providers: [EnrollmentsRepository, EnrollmentsService], controllers: [EnrollmentsController], exports: [EnrollmentsService] })
export class EnrollmentsModule {}


