import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListActivitiesDto } from './dto/list-activities.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async list(organizationId: string, query: ListActivitiesDto) {
    const where: Prisma.StudentActivityWhereInput = { organizationId, studentId: query.studentId, activityType: query.activityType ?? query.type };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.studentActivity.findMany({ where, skip: query.skip, take: query.limit, orderBy: [{ [query.sortBy]: query.sortOrder }, { id: 'asc' }] }),
      this.prisma.studentActivity.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }
  create(organizationId: string, dto: CreateActivityDto, tx: Prisma.TransactionClient, id?: string) {
    return tx.studentActivity.create({ data: {
      ...(id ? { id } : {}), organizationId, studentId: dto.studentId, activityType: dto.activityType,
      source: dto.source, payload: dto.payload, occurredAt: new Date(dto.occurredAt),
    } });
  }
}
