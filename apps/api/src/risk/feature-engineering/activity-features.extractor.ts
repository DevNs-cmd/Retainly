import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RiskFeatures } from '../risk.contract';
@Injectable()
export class ActivityFeaturesExtractor {
  constructor(private readonly prisma: PrismaService) {}
  async extract(studentId: string, organizationId: string, now = new Date()): Promise<RiskFeatures> {
    if (!studentId || !organizationId) throw new BadRequestException('Student and organization required');
    const since = new Date(now.getTime() - 30 * 86400000);
    const [groups, latest] = await this.prisma.$transaction([
      this.prisma.$queryRaw<Array<{ activityType: string; count: bigint }>>`
        SELECT activity_type AS "activityType", COUNT(*) AS count FROM student_activities
        WHERE organization_id = ${organizationId} AND student_id = ${studentId}
          AND occurred_at >= ${since} AND occurred_at <= ${now}
        GROUP BY activity_type
      `,
      this.prisma.studentActivity.findFirst({ where: { organizationId, studentId, occurredAt: { lte: now } }, orderBy: { occurredAt: 'desc' }, select: { occurredAt: true } }),
    ]);
    const student = await this.prisma.student.findFirst({where:{id:studentId,organizationId,deletedAt:null}});
    if(!student)throw new BadRequestException('Student not found');
    const [login,subscriptions] = await Promise.all([
      this.prisma.studentActivity.findFirst({where:{organizationId,studentId,activityType:'LOGIN',occurredAt:{lte:now}},orderBy:{occurredAt:'desc'}}),
      this.prisma.subscription.findMany({where:{organizationId,studentId,status:'ACTIVE'}}),
    ]);
    if(new Set(subscriptions.map(s=>s.currency)).size>1)throw new BadRequestException('Risk charges require a single currency');
    const tenureDays=Math.max(0,(now.getTime()-student.createdAt.getTime())/86400000);
    const countsByType = Object.fromEntries(groups.map(row => [row.activityType, Number(row.count)]));
    return { studentId, organizationId, windowDays: 30, tenureMonths:Math.floor(tenureDays/30),
      monthlyCharges:subscriptions.reduce((sum,s)=>sum+s.amountMinor/100*30/Math.max(1,(s.currentPeriodEnd.getTime()-s.currentPeriodStart.getTime())/86400000),0),
      daysSinceLastLogin:login?Math.max(0,(now.getTime()-login.occurredAt.getTime())/86400000):tenureDays,
      activityCount: Object.values(countsByType).reduce((sum, count) => sum + count, 0),
      daysSinceLastActivity: latest ? (now.getTime() - latest.occurredAt.getTime()) / 86400000 : null,
      lessonCompletions: countsByType.LESSON_COMPLETE || 0, failedPayments: countsByType.PAYMENT_FAILED || 0, countsByType,
    };
  }
}
