import { PlanTier } from '../data/entities';
export const PLAN_ORDER = [PlanTier.STARTER, PlanTier.GROWTH, PlanTier.PRO, PlanTier.AGENCY];
export const FEATURES: Record<string, PlanTier> = { automation: PlanTier.GROWTH, sms: PlanTier.PRO, slack: PlanTier.GROWTH, bulkImport: PlanTier.STARTER };
export const DEFAULT_LIMITS: Record<PlanTier, Record<string, number>> = {
 STARTER: { students: 100, courses: 5, emails: 1000 }, GROWTH: { students: 1000, courses: 25, emails: 10000 },
 PRO: { students: 5000, courses: 100, emails: 50000 }, AGENCY: { students: 25000, courses: 500, emails: 250000 },
};

