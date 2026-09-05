import { ICourseProvider } from '../course-provider.interface';
export class PodiaAdapter implements ICourseProvider { async getCourses(orgId: string) { return []; } }
