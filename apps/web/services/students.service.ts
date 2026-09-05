import { Student } from '../types/student';
import { MOCK_STUDENTS } from '../mock/students';
import { simulateApiCall } from './api-client';

export class StudentsService {
  static async getStudents(): Promise<Student[]> {
    return simulateApiCall(MOCK_STUDENTS);
  }

  static async getStudentById(id: string): Promise<Student | undefined> {
    const student = MOCK_STUDENTS.find((s) => s.id === id);
    return simulateApiCall(student);
  }

  static async getAtRiskStudents(): Promise<Student[]> {
    const atRisk = MOCK_STUDENTS.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL' || s.riskLevel === 'MEDIUM');
    return simulateApiCall(atRisk);
  }
}
