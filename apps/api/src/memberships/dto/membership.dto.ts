import { IsEmail, IsEnum } from 'class-validator'; import { ApiProperty } from '@nestjs/swagger'; import { Role } from '../../auth/auth.types';
export class InviteMemberDto { @ApiProperty() @IsEmail() email!: string; @ApiProperty({ enum: Role }) @IsEnum(Role) role!: Role; }
export class UpdateMemberDto { @ApiProperty({ enum: Role }) @IsEnum(Role) role!: Role; }

