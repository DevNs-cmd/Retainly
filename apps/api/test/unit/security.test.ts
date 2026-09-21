import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { AuthService } from '../../src/auth/services/auth.service';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Role } from '../../src/auth/auth.types';
import { PUBLIC_ROUTE, REQUIRED_ROLES } from '../../src/auth/auth.decorators';
import { TenantContext } from '../../src/tenant/tenant.context';
import { SignatureVerifier } from '../../src/webhooks/verification/signature-verifier';

test('Stripe signatures reject tampering, stale timestamps, malformed digests and accept rotation', () => {
  const verifier = new SignatureVerifier();
  const raw = Buffer.from('{"id":"evt_one"}');
  const secret = 'test-only-secret';
  const timestamp = 1700000000;
  const hash = createHmac('sha256', secret).update(timestamp + '.').update(raw).digest('hex');
  const signature = 't=' + timestamp + ',v1=' + hash;
  assert.doesNotThrow(() => verifier.verifyStripe(raw, signature, secret, timestamp * 1000));
  assert.doesNotThrow(() => verifier.verifyStripe(raw, signature + ',v1=' + '0'.repeat(64), secret, timestamp * 1000));
  assert.throws(() => verifier.verifyStripe(Buffer.from('{}'), signature, secret, timestamp * 1000), UnauthorizedException);
  assert.throws(() => verifier.verifyStripe(raw, signature, secret, (timestamp + 301) * 1000), UnauthorizedException);
  assert.throws(() => verifier.verifyStripe(raw, 't=' + timestamp + ',v1=bad', secret, timestamp * 1000), UnauthorizedException);
  assert.throws(() => verifier.verifyStripe(raw, signature + ',t=' + timestamp, secret, timestamp * 1000), UnauthorizedException);
});

test('tenant contexts isolate concurrent requests and reject mismatched organizations', async () => {
  const a = new TenantContext({ user: { userId: 'a', organizationId: 'org-a', role: Role.OWNER } });
  const b = new TenantContext({ user: { userId: 'b', organizationId: 'org-b', role: Role.VIEWER } });
  await Promise.all([Promise.resolve().then(() => assert.equal(a.organizationId, 'org-a')), Promise.resolve().then(() => assert.equal(b.organizationId, 'org-b'))]);
  assert.throws(() => a.assertOrganization('org-b'), ForbiddenException);
  assert.throws(() => new TenantContext({}).organizationId, ForbiddenException);
});

test('real JWT verification requires trusted signature, issuer, audience, expiry and organization role', async () => {
  const auth = new AuthService(new ConfigService({ AUTH_PROVIDER: 'clerk', AUTH_ISSUER: 'https://issuer.example/', AUTH_AUDIENCE: 'retainly' }));
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  Object.defineProperty(auth, 'jwks', { value: createLocalJWKSet({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] }) });
  const sign = (claims: Record<string, unknown> = {}, audience = 'retainly', expiry = '5m') =>
    new SignJWT({ org_id: 'org-a', org_role: 'org:admin', ...claims }).setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setSubject('user-a').setIssuer('https://issuer.example/').setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(privateKey);
  assert.deepEqual(await auth.authenticate(await sign()), { userId: 'user-a', organizationId: 'org-a', role: Role.ADMIN });
  await assert.rejects(auth.authenticate(await sign({}, 'wrong-audience')), UnauthorizedException);
  await assert.rejects(auth.authenticate(await sign({}, 'retainly', '-1h')), UnauthorizedException);
  await assert.rejects(auth.authenticate(await sign({ org_role: 'org:superuser' })), UnauthorizedException);
  await assert.rejects(auth.authenticate(await sign({ org_id: '' })), UnauthorizedException);
  const token = await sign();
  const pieces = token.split('.');
  pieces[1] = Buffer.from('{"sub":"attacker","org_id":"other","org_role":"OWNER"}').toString('base64url');
  await assert.rejects(auth.authenticate(pieces.join('.')), UnauthorizedException);
});

function context(request: object, handler: Function): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => request }), getHandler: () => handler, getClass: () => class TestController {} } as unknown as ExecutionContext;
}
test('auth bypass requires explicit Public metadata and roles deny viewers', async () => {
  const reflector = new Reflector();
  const auth = { authenticate: async () => { throw new Error('must not authenticate public route'); } } as unknown as AuthService;
  const guard = new AuthGuard(auth, reflector);
  const handler = () => {};
  await assert.rejects(guard.canActivate(context({ headers: {} }, handler)), UnauthorizedException);
  Reflect.defineMetadata(PUBLIC_ROUTE, true, handler);
  assert.equal(await guard.canActivate(context({ headers: {} }, handler)), true);
  const mutation = () => {};
  Reflect.defineMetadata(REQUIRED_ROLES, [Role.OWNER], mutation);
  const roles = new RolesGuard(reflector);
  assert.throws(() => roles.canActivate(context({ user: { organizationId: 'a', role: Role.VIEWER }, params: {} }, mutation)), ForbiddenException);
  assert.throws(() => roles.canActivate(context({ user: { organizationId: 'a', role: Role.OWNER }, params: { orgId: 'b' } }, mutation)), ForbiddenException);

  const regularHandler = () => {};
  assert.throws(() => roles.canActivate(context({ user: { organizationId: '', role: Role.VIEWER }, params: {} }, regularHandler)), ForbiddenException);

  const invitationHandler = () => {};
  Reflect.defineMetadata('auth:invitation', true, invitationHandler);
  assert.equal(roles.canActivate(context({ user: { organizationId: '', role: Role.VIEWER }, params: {} }, invitationHandler)), true);

  const onboardingHandler = () => {};
  Reflect.defineMetadata('auth:onboarding', true, onboardingHandler);
  assert.equal(roles.canActivate(context({ user: { organizationId: '', role: Role.VIEWER }, params: {} }, onboardingHandler)), true);
});

