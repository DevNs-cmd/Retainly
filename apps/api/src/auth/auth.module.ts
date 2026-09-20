import { MembershipGuard } from './guards/membership.guard';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
@Module({ providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_GUARD, useClass: MembershipGuard }, { provide: APP_GUARD, useClass: RolesGuard }], exports: [AuthService] })
export class AuthModule {}

