import { ICourseProvider } from '../course-provider.interface';
export class ThinkificAdapter implements ICourseProvider { async getCourses(orgId: string) { return []; } }
