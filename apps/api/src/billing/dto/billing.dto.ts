import { IsEnum, IsUUID } from 'class-validator'; import { ApiProperty } from '@nestjs/swagger'; import { PlanTier } from '../../data/entities';
export class CheckoutDto { @ApiProperty({ enum: PlanTier }) @IsEnum(PlanTier) planTier!: PlanTier; @ApiProperty() @IsUUID() requestId!: string; }

