export interface ICourseProvider { getCourses(orgId: string): Promise<any[]>; }
