import { DatabaseService, Predicate, Transaction } from '../data/database.service';
import { ModelMap, ModelName } from '../data/entities';
import { TenantContext } from '../tenant/tenant.context';
import { ResourceQueryDto } from './dto/resource-query.dto';
export abstract class ResourceRepository<K extends ModelName> {
 constructor(protected readonly db: DatabaseService, protected readonly tenant: TenantContext, readonly model: K, readonly softDelete = false) {}
 get organizationId() { return this.tenant.organizationId; }
 async list(query: ResourceQueryDto, extra: Predicate<ModelMap[K]> = {}) {
   const where = { ...(this.softDelete ? { deletedAt: null } : {}), ...extra } as Predicate<ModelMap[K]>;
   const [data, total] = await Promise.all([this.db.list(this.model, this.organizationId, where,
     { skip: query.skip, take: query.limit, orderBy: [{ createdAt: query.sortOrder }, { id: 'asc' }] } as never), this.db.count(this.model, this.organizationId, where)]);
   return { data, total, page: query.page, limit: query.limit };
 }
 async get(id: string) { return this.db.require(this.model, this.organizationId, id); }
 create(data: Partial<ModelMap[K]>, tx?: Transaction) { return this.db.create(this.model, this.organizationId, data, tx); }
 update(id: string, data: Partial<ModelMap[K]>, tx?: Transaction) { return this.db.update(this.model, this.organizationId, id, data, tx); }
 remove(id: string) { return this.softDelete ? this.update(id, { deletedAt: new Date() } as unknown as Partial<ModelMap[K]>) : this.db.remove(this.model, this.organizationId, id); }
}


