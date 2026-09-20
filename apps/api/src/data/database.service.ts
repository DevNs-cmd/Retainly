import { Global, Injectable, Module, NotFoundException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModelMap, ModelName, Row } from './entities';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_LIMITS } from '../billing/plan-policy';
import { ForbiddenException } from '@nestjs/common';
export type Predicate<T> = { [P in keyof T]?: T[P] | { equals?: T[P]; in?: T[P][]; not?: T[P]; gt?: T[P]; gte?: T[P]; lt?: T[P]; lte?: T[P]; contains?: string; mode?: string; } } & { AND?: Predicate<T>[]; OR?: Predicate<T>[] };
export interface ReadOptions<T> { distinct?: (keyof T)[]; skip?: number; take?: number; orderBy?: Partial<Record<keyof T, 'asc'|'desc'>> | Partial<Record<keyof T, 'asc'|'desc'>>[]; }
export interface Delegate<T> {
 findMany(args: { where: Predicate<T> } & ReadOptions<T>): Promise<T[]>;
 findFirst(args: { where: Predicate<T> } & ReadOptions<T>): Promise<T | null>;
 count(args: { where: Predicate<T> }): Promise<number>;
 create(args: { data: Partial<T> }): Promise<T>;
 updateMany(args: { where: Predicate<T>; data: Partial<T> }): Promise<{ count: number }>;
 deleteMany(args: { where: Predicate<T> }): Promise<{ count: number }>;
}
export type Transaction = Prisma.TransactionClient;
/** Only this bridge casts a future generated delegate. It fails closed when the model is absent. */
@Injectable()
export class DatabaseService {
 constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
 private table<K extends ModelName>(name: K, tx?: Transaction): Delegate<ModelMap[K]> {
   const delegate = (tx || this.prisma)[name as keyof (PrismaService | Transaction)] as unknown;
   if (!delegate || typeof (delegate as { findMany?: unknown }).findMany !== 'function')
     throw new ServiceUnavailableException('Database contract unavailable: ' + name);
   return delegate as Delegate<ModelMap[K]>;
 }
 private where<K extends ModelName>(name: K, org: string, where: Predicate<ModelMap[K]> = {}): Predicate<ModelMap[K]> {
   if (!org) throw new BadRequestException('Organization context required');
   // Organization is the tenant root; all other contracted models have organizationId.
   const tenant = name === 'organization' ? { id: org } : { organizationId: org };
   return { AND: [tenant, where] } as Predicate<ModelMap[K]>;
 }
 list<K extends ModelName>(name: K, org: string, where: Predicate<ModelMap[K]> = {}, options: ReadOptions<ModelMap[K]> = {}, tx?: Transaction) {
   return this.table(name, tx).findMany({ where: this.where(name, org, where), ...options });
 }
 first<K extends ModelName>(name: K, org: string, where: Predicate<ModelMap[K]>, tx?: Transaction) {
   return this.table(name, tx).findFirst({ where: this.where(name, org, where) });
 }
 async require<K extends ModelName>(name: K, org: string, id: string, tx?: Transaction) {
   const row = await this.first(name, org, { id } as Predicate<ModelMap[K]>, tx);
   if (!row) throw new NotFoundException(name + ' not found');
   return row;
 }
 count<K extends ModelName>(name: K, org: string, where: Predicate<ModelMap[K]> = {}, tx?: Transaction) {
   return this.table(name, tx).count({ where: this.where(name, org, where) });
 }
 create<K extends ModelName>(name: K, org: string, data: Partial<ModelMap[K]>, tx?: Transaction) {
   if (!org) throw new BadRequestException('Organization context required');
   const scoped = name === 'organization' ? { ...data, id: org } : { ...data, organizationId: org };
   const write = async (connection: Transaction) => {
     const metric = name === 'student' ? 'students' : name === 'course' ? 'courses' : name === 'notificationLog' && (data as Partial<ModelMap['notificationLog']>).channel === 'EMAIL' ? 'emails' : undefined;
     if (metric) {
       const organization = await this.require('organization', org, org, connection);
       const configured = JSON.parse(this.config.get<string>('PLAN_LIMITS_JSON') || '{}');
       const limit = configured[organization.planTier]?.[metric] ?? DEFAULT_LIMITS[organization.planTier][metric];
       const used = metric === 'emails'
         ? await this.count('notificationLog', org, { channel:'EMAIL', createdAt:{gte:new Date(new Date().toISOString().slice(0,7)+'-01T00:00:00Z')}, status:{in:['PENDING','SENDING','SENT','UNCERTAIN','RETRYING']} }, connection)
         : await this.count(name as 'student'|'course', org, {deletedAt:null}, connection);
       if (!Number.isFinite(limit) || used >= limit) throw new ForbiddenException('Plan limit reached: '+metric);
     }
     return this.table(name, connection).create({data:scoped as Partial<ModelMap[K]>});
   };
   return tx ? write(tx) : this.transaction(write);
 }
 async update<K extends ModelName>(name: K, org: string, id: string, data: Partial<ModelMap[K]>, tx?: Transaction) {
   const { id: ignoredId, organizationId: ignoredOrg, createdAt: ignoredCreated, ...safe } = data;
   const result = await this.table(name, tx).updateMany({ where: this.where(name, org, { id } as Predicate<ModelMap[K]>), data: safe as Partial<ModelMap[K]> });
   if (!result.count) throw new NotFoundException(name + ' not found');
   return this.require(name, org, id, tx);
 }
 async remove<K extends ModelName>(name: K, org: string, id: string, tx?: Transaction) {
   const result = await this.table(name, tx).deleteMany({ where: this.where(name, org, { id } as Predicate<ModelMap[K]> ) });
   if (!result.count) throw new NotFoundException(name + ' not found');
   return { deleted: true };
 }
 transaction<T>(fn: (tx: Transaction) => Promise<T>) { return this.prisma.$transaction(fn, { isolationLevel: 'Serializable', timeout: 20000 }); }
 async once<T>(org: string, consumer: string, eventId: string, fn: (tx: Transaction) => Promise<T>): Promise<T | undefined> {
   return this.transaction(async tx => {
     if (await this.first('consumerReceipt', org, { consumer, eventId }, tx)) return undefined;
     const result = await fn(tx);
     await this.create('consumerReceipt', org, { consumer, eventId, completedAt: new Date() }, tx);
     return result;
   });
 }
 async organizationsForScheduling(afterId?: string) {
   // Explicit privileged scheduler scan. Never expose to an HTTP controller.
   return this.prisma.organization.findMany({ where: afterId ? { id: { gt: afterId } } : {}, orderBy: { id: 'asc' }, take: 100 });
 }
}
@Global() @Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}


