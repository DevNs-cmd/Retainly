import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../data/database.service';
import { TenantContext } from '../tenant/tenant.context';
import { Role } from '../auth/auth.types';
import { PlanTier } from '../data/entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { OrganizationsRepository } from './organizations.repository';
@Injectable() export class OrganizationsService {
 constructor(private readonly db: DatabaseService, private readonly tenant: TenantContext, private readonly repository: OrganizationsRepository) {}
 create(dto: CreateOrganizationDto) {
   const org = this.tenant.organizationId;
   return this.db.transaction(async tx => {
     if (await this.db.first('organization', org, { id: org }, tx)) throw new ConflictException('Organization already exists');
     const organization = await this.repository.create({ name: dto.name, timezone: 'UTC', planTier: PlanTier.STARTER, deletedAt: null }, tx);
     await this.db.create('user', org, { id: this.tenant.userId, email: dto.ownerEmail, name: dto.ownerName }, tx);
     await this.db.create('membership', org, { userId: this.tenant.userId, role: Role.OWNER, invitationStatus: 'ACCEPTED', deletedAt: null }, tx);
     return organization;
   });
 }
 get(id: string) { this.tenant.assertOrganization(id); return this.repository.get(id); }
 update(id: string, dto: UpdateOrganizationDto) { this.tenant.assertOrganization(id); return this.repository.update(id, dto); }
 remove(id: string) { this.tenant.assertOrganization(id); return this.repository.remove(id); }
}

