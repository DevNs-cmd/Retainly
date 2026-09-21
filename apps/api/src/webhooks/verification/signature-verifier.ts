import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
@Injectable()
export class SignatureVerifier {
  verifyRawSha256(payload: Buffer, signature: string, secret: string) {
    if (!/^[a-fA-F0-9]{64}$/.test(signature)) throw new UnauthorizedException('Invalid webhook signature');
    const expected = createHmac('sha256', secret).update(payload).digest();
    if (!secret || !timingSafeEqual(expected, Buffer.from(signature, 'hex'))) throw new UnauthorizedException('Invalid webhook signature');
  }
  verifyMandrill(url: string, fields: Record<string, string>, signature: string, secret: string) {
    const value = url + Object.keys(fields).sort().map(key => key + fields[key]).join('');
    const expected = createHmac('sha1', secret).update(value).digest();
    const actual = Buffer.from(signature, 'base64');
    if (!secret || actual.length !== expected.length || !timingSafeEqual(expected, actual)) throw new UnauthorizedException('Invalid webhook signature');
  }
  verifyStripe(payload: Buffer, header: string, secret: string, now = Date.now()): void {
    const parts = header.split(',').map(x => x.trim().split('='));
    const timestamps = parts.filter(([key]) => key === 't').map(([, value]) => value);
    if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0])) throw new UnauthorizedException('Invalid webhook signature');
    const timestamp = Number(timestamps[0]);
    if (!Number.isSafeInteger(timestamp) || Math.abs(now / 1000 - timestamp) > 300) throw new UnauthorizedException('Expired webhook signature');
    const expected = createHmac('sha256', secret).update(timestamps[0] + '.').update(payload).digest();
    const matches = parts.filter(([key]) => key === 'v1').some(([, value]) => {
      if (!/^[a-fA-F0-9]{64}$/.test(value || '')) return false;
      return timingSafeEqual(expected, Buffer.from(value, 'hex'));
    });
    if (!secret || !matches) throw new UnauthorizedException('Invalid webhook signature');
  }
}

