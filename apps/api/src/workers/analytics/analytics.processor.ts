import { Injectable } from '@nestjs/common';import { Job } from 'bullmq';import { DatabaseService,Predicate } from '../../data/database.service';import { ModelName,ModelMap,Segment,EnrollmentStatus } from '../../data/entities';import { PrismaService } from '../../prisma/prisma.service';import { TenantCache } from '../../common/cache/tenant-cache.service';import { SchedulerService } from '../scheduler.service';import { JobEnvelope,envelope,stableId } from '../job-envelope';
@Injectable()export class AnalyticsProcessor{
 constructor(private readonly db:DatabaseService,private readonly prisma:PrismaService,private readonly cache:TenantCache,private readonly scheduler:SchedulerService){}
 private async all<K extends ModelName>(model:K,org:string,where:Predicate<ModelMap[K]>={}){
  const result:ModelMap[K][]=[];let cursor:string|undefined;
  while(true){const page=await this.db.list(model,org,{...where,...(cursor?{id:{gt:cursor}}:{})} as Predicate<ModelMap[K]>,{take:1000,orderBy:{id:'asc'}} as never);result.push(...page);if(page.length<1000)break;cursor=page[page.length-1].id;}return result;
 }
 private save(org:string,kind:string,key:string,period:Date,data:Record<string,unknown>){
  const id=stableId(org,kind,key,period.toISOString());
  return this.db.transaction(async tx=>{const existing=await this.db.first('analyticsAggregate',org,{id},tx);return existing?this.db.update('analyticsAggregate',org,id,{data},tx):this.db.create('analyticsAggregate',org,{id,kind,key,period,data},tx);});
 }
 async process(job:Job<JobEnvelope>){
  if(job.name==='SCHEDULE_ORGANIZATIONS')return this.scheduler.dispatch('analytics');
  const {organizationId:org}=envelope(job);const today=new Date(new Date().toISOString().slice(0,10)+'T00:00:00Z');
  const [students,enrollments,subscriptions,campaigns,recipients,snapshots]=await Promise.all([this.all('student',org,{deletedAt:null}),this.all('enrollment',org,{deletedAt:null}),this.all('subscription',org),this.all('campaign',org,{archivedAt:null}),this.all('campaignRecipient',org),this.all('riskSnapshot',org)]);
  const distribution:Record<string,number>={HIGH_RISK:0,MEDIUM_RISK:0,LOW_RISK:0,CHAMPION:0,UNSCORED:0};for(const student of students)distribution[student.segment||'UNSCORED']++;
  const atRisk=new Set(students.filter(s=>s.segment===Segment.HIGH_RISK).map(s=>s.id));const revenueAtRisk:Record<string,number>={};
  for(const subscription of subscriptions)if(atRisk.has(subscription.studentId)&&subscription.status===EnrollmentStatus.ACTIVE)revenueAtRisk[subscription.currency]=(revenueAtRisk[subscription.currency]||0)+subscription.amountMinor;
  const previouslyHigh=new Set(snapshots.filter(s=>s.segment===Segment.HIGH_RISK).map(s=>s.studentId));
  await this.save(org,'overview','organization',today,{churnRate:subscriptions.length?subscriptions.filter(s=>s.status===EnrollmentStatus.CANCELLED).length/subscriptions.length:0,atRiskCount:atRisk.size,revenueAtRiskMinorByCurrency:revenueAtRisk,studentsSaved:students.filter(s=>previouslyHigh.has(s.id)&&s.segment!==null&&s.segment!==Segment.HIGH_RISK).length});
  await this.save(org,'risk-trends','distribution',today,distribution);
  for(const campaign of campaigns){const rows=recipients.filter(r=>r.campaignId===campaign.id);await this.save(org,'campaigns',campaign.id,today,{campaignId:campaign.id,sent:rows.filter(r=>r.sentAt).length,opened:rows.filter(r=>r.openedAt).length,converted:rows.filter(r=>r.convertedAt).length});}
  const courses=await this.all('course',org,{deletedAt:null});
  for(const course of courses){const rows=enrollments.filter(e=>e.courseId===course.id);await this.save(org,'courses',course.id,today,{courseId:course.id,enrollmentCount:rows.length,activeCount:rows.filter(e=>e.status===EnrollmentStatus.ACTIVE).length,meanCompletion:rows.length?rows.reduce((sum,e)=>sum+e.completionPercent,0)/rows.length:0,atRiskCount:rows.filter(e=>atRisk.has(e.studentId)).length});}
  const activity=await this.prisma.$queryRaw<Array<{day:Date;studentId:string;courseId:string|null;activityType:string;count:bigint}>>`
   SELECT date_trunc('day', occurred_at) AS day, student_id AS "studentId", payload->>'courseId' AS "courseId", activity_type AS "activityType", COUNT(*) AS count
   FROM student_activities WHERE organization_id=${org} AND occurred_at >= NOW()-INTERVAL '30 days'
   GROUP BY day,student_id,payload->>'courseId',activity_type
  `;
  for(const row of activity)await this.save(org,'activity-daily',row.studentId+'-'+(row.courseId||'')+'-'+row.activityType,new Date(row.day),{studentId:row.studentId,courseId:row.courseId,activityType:row.activityType,count:Number(row.count)});
  const activeMonths=await this.prisma.$queryRaw<Array<{studentId:string;month:Date}>>`
    SELECT DISTINCT student_id AS "studentId",date_trunc('month',occurred_at) AS month FROM student_activities WHERE organization_id=${org} AND occurred_at <= NOW()
  `;
  const cohorts=new Map<string,typeof students>();
  for(const student of students){const month=new Date(student.createdAt).toISOString().slice(0,7);cohorts.set(month,[...(cohorts.get(month)||[]),student]);}
  for(const [month,members]of cohorts){
   const memberIds=new Set(members.map(s=>s.id));const periods=new Map<string,Set<string>>();
   for(const activity of activeMonths)if(memberIds.has(activity.studentId)){const activeMonth=new Date(activity.month).toISOString().slice(0,7);if(activeMonth>=month){const ids=periods.get(activeMonth)||new Set<string>();ids.add(activity.studentId);periods.set(activeMonth,ids);}}
   await this.save(org,'cohorts',month,today,{cohortMonth:month,enrolledCount:members.length,retention:Array.from(periods.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([period,ids])=>({period,retainedCount:ids.size,rate:ids.size/members.length}))});
  }
  await this.cache.invalidate(org);
 }
}

