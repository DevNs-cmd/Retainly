import { AnalyticsSourceData, AnalyticsTimeRange, CohortDataPoint } from '../types/analytics';

const MOCK_COHORTS: CohortDataPoint[] = [
  { cohort: 'Apr 2026', initialSize: 620, week0: 100, week2: 92, week4: 85, week6: 81, week8: 79 },
  { cohort: 'May 2026', initialSize: 740, week0: 100, week2: 94, week4: 88, week6: 84, week8: 82 },
  { cohort: 'Jun 2026', initialSize: 810, week0: 100, week2: 95, week4: 90, week6: 86, week8: 85 },
  { cohort: 'Jul 2026', initialSize: 890, week0: 100, week2: 96, week4: 91, week6: 88, week8: 87 },
  { cohort: 'Aug 2026', initialSize: 950, week0: 100, week2: 97, week4: 93, week6: 90, week8: 89 }
];

export const MOCK_ANALYTICS_DATA: Record<AnalyticsTimeRange, AnalyticsSourceData> = {
  '7D': {
    range: '7D',
    summary: {
      retentionRate: 88.9,
      retentionRateDelta: 1.4,
      churnRate: 3.1,
      churnRateDelta: -0.5,
      recoveredRevenue: 4280,
      recoveredRevenueDelta: 8.3,
      campaignRoi: 15.1,
      campaignRoiDelta: 0.9,
      totalStudents: 4820,
      savedStudents: 34
    },
    retentionTrend: [
      { label: 'Sep 12', date: '2026-09-12', retentionRate: 87.2, churnRate: 3.8, activeStudents: 4790, atRiskStudents: 360, interventions: 18 },
      { label: 'Sep 13', date: '2026-09-13', retentionRate: 87.5, churnRate: 3.6, activeStudents: 4795, atRiskStudents: 354, interventions: 22 },
      { label: 'Sep 14', date: '2026-09-14', retentionRate: 88.0, churnRate: 3.4, activeStudents: 4802, atRiskStudents: 348, interventions: 27 },
      { label: 'Sep 15', date: '2026-09-15', retentionRate: 88.1, churnRate: 3.3, activeStudents: 4808, atRiskStudents: 345, interventions: 19 },
      { label: 'Sep 16', date: '2026-09-16', retentionRate: 88.4, churnRate: 3.2, activeStudents: 4814, atRiskStudents: 340, interventions: 31 },
      { label: 'Sep 17', date: '2026-09-17', retentionRate: 88.6, churnRate: 3.1, activeStudents: 4818, atRiskStudents: 338, interventions: 25 },
      { label: 'Sep 18', date: '2026-09-18', retentionRate: 88.9, churnRate: 3.1, activeStudents: 4820, atRiskStudents: 332, interventions: 29 }
    ],
    revenueTrend: [
      { label: 'Sep 12', recoveredRevenue: 480, atRiskRevenue: 1250 },
      { label: 'Sep 13', recoveredRevenue: 590, atRiskRevenue: 1100 },
      { label: 'Sep 14', recoveredRevenue: 640, atRiskRevenue: 980 },
      { label: 'Sep 15', recoveredRevenue: 520, atRiskRevenue: 940 },
      { label: 'Sep 16', recoveredRevenue: 710, atRiskRevenue: 890 },
      { label: 'Sep 17', recoveredRevenue: 630, atRiskRevenue: 850 },
      { label: 'Sep 18', recoveredRevenue: 710, atRiskRevenue: 810 }
    ],
    cohortRetention: MOCK_COHORTS
  },
  '30D': {
    range: '30D',
    summary: {
      retentionRate: 87.4,
      retentionRateDelta: 3.2,
      churnRate: 4.2,
      churnRateDelta: -1.1,
      recoveredRevenue: 18420,
      recoveredRevenueDelta: 12.6,
      campaignRoi: 14.2,
      campaignRoiDelta: 1.8,
      totalStudents: 4820,
      savedStudents: 126
    },
    retentionTrend: [
      { label: 'Week 1', date: '2026-08-22', retentionRate: 83.5, churnRate: 5.4, activeStudents: 4650, atRiskStudents: 410, interventions: 68 },
      { label: 'Week 2', date: '2026-08-29', retentionRate: 84.8, churnRate: 5.0, activeStudents: 4690, atRiskStudents: 390, interventions: 84 },
      { label: 'Week 3', date: '2026-09-05', retentionRate: 85.9, churnRate: 4.6, activeStudents: 4735, atRiskStudents: 375, interventions: 92 },
      { label: 'Week 4', date: '2026-09-12', retentionRate: 87.0, churnRate: 4.3, activeStudents: 4790, atRiskStudents: 350, interventions: 110 },
      { label: 'Week 5', date: '2026-09-18', retentionRate: 87.4, churnRate: 4.2, activeStudents: 4820, atRiskStudents: 342, interventions: 126 }
    ],
    revenueTrend: [
      { label: 'Week 1', recoveredRevenue: 2800, atRiskRevenue: 7200 },
      { label: 'Week 2', recoveredRevenue: 3450, atRiskRevenue: 6400 },
      { label: 'Week 3', recoveredRevenue: 3920, atRiskRevenue: 5600 },
      { label: 'Week 4', recoveredRevenue: 4150, atRiskRevenue: 4900 },
      { label: 'Week 5', recoveredRevenue: 4100, atRiskRevenue: 4580 }
    ],
    cohortRetention: MOCK_COHORTS
  },
  '90D': {
    range: '90D',
    summary: {
      retentionRate: 86.1,
      retentionRateDelta: 4.8,
      churnRate: 4.6,
      churnRateDelta: -1.7,
      recoveredRevenue: 52600,
      recoveredRevenueDelta: 16.4,
      campaignRoi: 13.8,
      campaignRoiDelta: 2.1,
      totalStudents: 4820,
      savedStudents: 368
    },
    retentionTrend: [
      { label: 'Jul W1', date: '2026-07-01', retentionRate: 81.2, churnRate: 6.2, activeStudents: 4210, atRiskStudents: 480, interventions: 140 },
      { label: 'Jul W3', date: '2026-07-15', retentionRate: 82.5, churnRate: 5.8, activeStudents: 4320, atRiskStudents: 460, interventions: 155 },
      { label: 'Aug W1', date: '2026-08-01', retentionRate: 83.8, churnRate: 5.3, activeStudents: 4460, atRiskStudents: 430, interventions: 172 },
      { label: 'Aug W3', date: '2026-08-15', retentionRate: 85.0, churnRate: 4.9, activeStudents: 4590, atRiskStudents: 405, interventions: 185 },
      { label: 'Sep W1', date: '2026-09-01', retentionRate: 86.2, churnRate: 4.5, activeStudents: 4710, atRiskStudents: 365, interventions: 210 },
      { label: 'Sep W3', date: '2026-09-18', retentionRate: 87.4, churnRate: 4.2, activeStudents: 4820, atRiskStudents: 342, interventions: 230 }
    ],
    revenueTrend: [
      { label: 'Jul W1', recoveredRevenue: 6800, atRiskRevenue: 16200 },
      { label: 'Jul W3', recoveredRevenue: 7900, atRiskRevenue: 14800 },
      { label: 'Aug W1', recoveredRevenue: 8900, atRiskRevenue: 13100 },
      { label: 'Aug W3', recoveredRevenue: 9400, atRiskRevenue: 11900 },
      { label: 'Sep W1', recoveredRevenue: 9800, atRiskRevenue: 10400 },
      { label: 'Sep W3', recoveredRevenue: 9800, atRiskRevenue: 9600 }
    ],
    cohortRetention: MOCK_COHORTS
  },
  '12M': {
    range: '12M',
    summary: {
      retentionRate: 84.5,
      retentionRateDelta: 7.9,
      churnRate: 5.1,
      churnRateDelta: -3.4,
      recoveredRevenue: 194800,
      recoveredRevenueDelta: 24.2,
      campaignRoi: 14.7,
      campaignRoiDelta: 3.5,
      totalStudents: 4820,
      savedStudents: 1420
    },
    retentionTrend: [
      { label: 'Oct 25', date: '2025-10-01', retentionRate: 77.0, churnRate: 8.5, activeStudents: 3100, atRiskStudents: 580, interventions: 210 },
      { label: 'Nov 25', date: '2025-11-01', retentionRate: 78.4, churnRate: 7.9, activeStudents: 3250, atRiskStudents: 550, interventions: 240 },
      { label: 'Dec 25', date: '2025-12-01', retentionRate: 79.1, churnRate: 7.5, activeStudents: 3380, atRiskStudents: 530, interventions: 260 },
      { label: 'Jan 26', date: '2026-01-01', retentionRate: 80.5, churnRate: 6.9, activeStudents: 3520, atRiskStudents: 510, interventions: 290 },
      { label: 'Feb 26', date: '2026-02-01', retentionRate: 81.8, churnRate: 6.4, activeStudents: 3710, atRiskStudents: 480, interventions: 320 },
      { label: 'Mar 26', date: '2026-03-01', retentionRate: 82.9, churnRate: 5.9, activeStudents: 3920, atRiskStudents: 460, interventions: 345 },
      { label: 'Apr 26', date: '2026-04-01', retentionRate: 83.8, churnRate: 5.5, activeStudents: 4100, atRiskStudents: 430, interventions: 380 },
      { label: 'May 26', date: '2026-05-01', retentionRate: 84.7, churnRate: 5.1, activeStudents: 4290, atRiskStudents: 410, interventions: 410 },
      { label: 'Jun 26', date: '2026-06-01', retentionRate: 85.5, churnRate: 4.8, activeStudents: 4450, atRiskStudents: 390, interventions: 440 },
      { label: 'Jul 26', date: '2026-07-01', retentionRate: 86.2, churnRate: 4.5, activeStudents: 4600, atRiskStudents: 375, interventions: 470 },
      { label: 'Aug 26', date: '2026-08-01', retentionRate: 86.9, churnRate: 4.3, activeStudents: 4720, atRiskStudents: 355, interventions: 510 },
      { label: 'Sep 26', date: '2026-09-01', retentionRate: 87.4, churnRate: 4.2, activeStudents: 4820, atRiskStudents: 342, interventions: 540 }
    ],
    revenueTrend: [
      { label: 'Oct 25', recoveredRevenue: 9800, atRiskRevenue: 28400 },
      { label: 'Nov 25', recoveredRevenue: 11200, atRiskRevenue: 27100 },
      { label: 'Dec 25', recoveredRevenue: 12500, atRiskRevenue: 25900 },
      { label: 'Jan 26', recoveredRevenue: 13900, atRiskRevenue: 24500 },
      { label: 'Feb 26', recoveredRevenue: 14800, atRiskRevenue: 23200 },
      { label: 'Mar 26', recoveredRevenue: 16100, atRiskRevenue: 21800 },
      { label: 'Apr 26', recoveredRevenue: 17200, atRiskRevenue: 20400 },
      { label: 'May 26', recoveredRevenue: 18400, atRiskRevenue: 19100 },
      { label: 'Jun 26', recoveredRevenue: 19100, atRiskRevenue: 17800 },
      { label: 'Jul 26', recoveredRevenue: 19800, atRiskRevenue: 16200 },
      { label: 'Aug 26', recoveredRevenue: 20900, atRiskRevenue: 14900 },
      { label: 'Sep 26', recoveredRevenue: 21100, atRiskRevenue: 13800 }
    ],
    cohortRetention: MOCK_COHORTS
  }
};
