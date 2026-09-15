import { Injectable, BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
@Injectable()
export class ProviderHttp {
 async request<T>(url: string, init: RequestInit = {}): Promise<T> {
   const parsed = new URL(url);
   if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new ServiceUnavailableException('Provider endpoint must use HTTPS');
   try {
     const response = await fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(15000) });
     if (!response.ok) throw new Error('Provider status ' + response.status);
     if (response.status === 204) return undefined as T;
     return await response.json() as T;
   } catch { throw new BadGatewayException('External provider request failed'); }
 }
}

