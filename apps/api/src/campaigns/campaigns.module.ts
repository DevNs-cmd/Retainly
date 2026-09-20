import { OutboxModule } from '../outbox/outbox.module';
import { Module } from '@nestjs/common';
import { CampaignsRepository } from './campaigns.repository';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
@Module({ imports: [OutboxModule], providers: [CampaignsRepository, CampaignsService], controllers: [CampaignsController], exports: [CampaignsService] })
export class CampaignsModule {}


