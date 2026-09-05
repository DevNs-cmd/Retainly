import { ICourseProvider } from '../course-provider.interface';
export class TeachableAdapter implements ICourseProvider { async getCourses(orgId: string) { return []; } }
