import { Module } from '@nestjs/common';
import { CoachTasksRepository } from './coach-tasks.repository';
import { CoachTasksService } from './coach-tasks.service';
import { CoachTasksController } from './coach-tasks.controller';
@Module({ providers: [CoachTasksRepository, CoachTasksService], controllers: [CoachTasksController], exports: [CoachTasksService] })
export class CoachTasksModule {}

