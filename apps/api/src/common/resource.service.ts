import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResourceRepository } from './resource.repository';
import { ModelMap, ModelName } from '../data/entities';
import { DatabaseService, Predicate, Transaction } from '../data/database.service';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { TenantCache } from './cache/tenant-cache.service';
export class ResourceService<K extends ModelName> {
 constructor(protected readonly repository: ResourceRepository<K>, protected readonly db: DatabaseService, protected readonly cache: TenantCache) {}
 protected filters(query: ResourceQueryDto): Predicate<ModelMap[K]> {
   const allowed: Record<string, string[]> = { student: ['segment'], enrollment: ['studentId','courseId','status'], subscription: ['studentId','status'], coachTask: ['studentId','status'], campaign: ['status'] };
   return Object.fromEntries(Object.entries(query).filter(([key, value]) => value !== undefined && (allowed[this.repository.model] || []).includes(key))) as Predicate<ModelMap[K]>;
 }
 list(query: ResourceQueryDto) {
   const read = () => this.repository.list(query, this.filters(query));
   return this.repository.model === 'student' ? this.cache.remember(this.repository.organizationId, 'students', query, 60, read) : read();
 }
 async get(id: string) {
   const row = await this.repository.get(id);
   if (this.repository.softDelete && (row as unknown as { deletedAt: Date | null }).deletedAt) throw new NotFoundException('Resource not found');
   return row;
 }
 protected async validate(data: Partial<ModelMap[K]>, tx?: Transaction) {
   const record = data as Record<string, unknown>;
   for (const [field, model] of Object.entries({ studentId: 'student', courseId: 'course', coachId: 'user', assignedCoachId: 'user', automationRuleId: 'automationRule' })) {
     if (typeof record[field] === 'string') {
       const related = await this.db.require(model as ModelName, this.repository.organizationId, record[field] as string, tx);
       if ('deletedAt' in related && related.deletedAt) throw new BadRequestException('Related resource is deleted');
     }
   }
 }
 async create(data: Partial<ModelMap[K]>) {
   const row = await this.db.transaction(async tx => { await this.validate(data, tx); return this.repository.create(data, tx); });
   await this.cache.invalidate(this.repository.organizationId); return row;
 }
 async update(id: string, data: Partial<ModelMap[K]>) {
   await this.get(id);
   const row = await this.db.transaction(async tx => { await this.validate(data, tx); return this.repository.update(id, data, tx); });
   await this.cache.invalidate(this.repository.organizationId); return row;
 }
 async remove(id: string) { await this.get(id); const result = await this.repository.remove(id); await this.cache.invalidate(this.repository.organizationId); return result; }
}

