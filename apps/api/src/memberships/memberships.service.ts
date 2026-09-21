import { InvitationService } from './invitation.service';
import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService, Transaction } from '../data/database.service'; import { TenantContext } from '../tenant/tenant.context';
import { Role } from '../auth/auth.types'; import { MembershipsRepository } from './memberships.repository'; import { ResourceQueryDto } from '../common/dto/resource-query.dto'; import { InviteMemberDto, UpdateMemberDto } from './dto/membership.dto';
@Injectable() export class MembershipsService {
 constructor(private readonly repository: MembershipsRepository, private readonly db: DatabaseService, private readonly tenant: TenantContext,private readonly invitations:InvitationService) {}
 list(query: ResourceQueryDto) { return this.repository.list(query); }
 get(id: string) { return this.repository.get(id); }
 async invite(dto: InviteMemberDto) {
   if (dto.role === Role.OWNER && this.tenant.role !== Role.OWNER) throw new ForbiddenException('Only owners can appoint an owner');
   return this.db.transaction(async tx => {
     if (await this.db.first('membership', this.tenant.organizationId, { invitationEmail: dto.email.toLowerCase(), deletedAt: null }, tx)) throw new ConflictException('Member already invited');
     const member=await this.repository.create({ userId: null, invitationEmail: dto.email.toLowerCase(), invitationStatus: 'PENDING', role: dto.role, deletedAt: null }, tx);
     await this.invitations.enqueue(member,tx);return member;
   });
 }
 private async canChange(id: string, nextRole: Role | null, tx: Transaction) {
   const member = await this.db.require('membership', this.tenant.organizationId, id, tx);
   if ((member.role === Role.OWNER || nextRole === Role.OWNER) && this.tenant.role !== Role.OWNER) throw new ForbiddenException('Only owners can change ownership');
   if (member.role === Role.OWNER && nextRole !== Role.OWNER && await this.db.count('membership', this.tenant.organizationId, { role: Role.OWNER, deletedAt: null }, tx) <= 1) throw new ConflictException('Cannot remove the last owner');
 }
 update(id: string, dto: UpdateMemberDto) { return this.db.transaction(async tx => { await this.canChange(id, dto.role, tx); return this.repository.update(id, dto, tx); }); }
 remove(id: string) { return this.db.transaction(async tx => { await this.canChange(id, null, tx); return this.repository.update(id, { deletedAt: new Date() }, tx); }); }
}

