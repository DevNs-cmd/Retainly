import { InvitationService } from './invitation.service';import { InvitationsController } from './invitations.controller';import { OutboxModule } from '../outbox/outbox.module';
import { Global, Module } from '@nestjs/common'; import { MembershipsController } from './memberships.controller'; import { MembershipsRepository } from './memberships.repository'; import { MembershipsService } from './memberships.service';
@Global() @Module({ imports:[OutboxModule], controllers: [InvitationsController,MembershipsController], providers: [InvitationService,MembershipsRepository, MembershipsService], exports: [InvitationService,MembershipsService] }) export class MembershipsModule {}

