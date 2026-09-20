import { OutboxModule } from '../outbox/outbox.module';
import { Module } from '@nestjs/common';import { AutomationRepository } from './automation.repository';import { AutomationService } from './automation.service';import { AutomationController } from './automation.controller';
@Module({imports:[OutboxModule],providers:[AutomationRepository,AutomationService],controllers:[AutomationController],exports:[AutomationService]})export class AutomationModule{}

