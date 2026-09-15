import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { AuthUser, Role } from '../auth.types';

@Injectable()
export class AuthService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly provider: string;
  constructor(private readonly config: ConfigService) {
    this.provider = config.get<string>('AUTH_PROVIDER') || 'clerk';
    if (!['clerk', 'auth0'].includes(this.provider)) throw new Error('AUTH_PROVIDER must be clerk or auth0');
    this.issuer = config.getOrThrow<string>('AUTH_ISSUER');
    this.audience = config.getOrThrow<string>('AUTH_AUDIENCE');
    const issuerUrl = new URL(this.issuer);
    if (issuerUrl.protocol !== 'https:') throw new Error('AUTH_ISSUER must use HTTPS');
    this.jwks = createRemoteJWKSet(new URL('.well-known/jwks.json', this.issuer.replace(/\/?$/, '/')));
  }
  async authenticate(token: string): Promise<AuthUser> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer, audience: this.audience, algorithms: ['RS256'],
        requiredClaims: ['sub', 'exp', 'iat'], clockTolerance: 5,
      });
      return this.userFromClaims(payload);
    } catch { throw new UnauthorizedException('Invalid or expired access token'); }
  }
  userFromClaims(payload: JWTPayload): AuthUser {
    const orgClaim = this.config.get<string>('AUTH_ORG_CLAIM') || 'org_id';
    const roleClaim = this.config.get<string>('AUTH_ROLE_CLAIM') || 'org_role';
    const organizationId = payload[orgClaim];
    const rawRole = payload[roleClaim];
    // Roles must be issued by the trusted identity provider, never supplied by headers.
    const role = typeof rawRole === 'string' ? rawRole.replace(/^org:/, '').toUpperCase() : '';
    if (!payload.sub || typeof organizationId !== 'string' || !organizationId || !Object.values(Role).includes(role as Role)) {
      throw new UnauthorizedException('An active organization and recognized role are required');
    }
    return { userId: payload.sub, organizationId, role: role as Role };
  }
}
