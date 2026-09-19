/**
 * Centralized API Client abstraction for RETAINLY.
 * Simulates async NestJS REST API calls with realistic network latency.
 */
export async function simulateApiCall<T>(data: T, delayMs: number = 150): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delayMs);
  });
}
