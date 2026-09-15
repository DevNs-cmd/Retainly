import { Type } from 'class-transformer';import { IsString,IsEnum,IsNumber,IsBoolean,IsOptional,ValidateNested,IsArray,ArrayMinSize,ArrayMaxSize,Min,Max,MaxLength,MinLength,IsInt } from 'class-validator';import { ApiProperty,ApiPropertyOptional,PartialType } from '@nestjs/swagger';import { TriggerType,ActionType,EnrollmentStatus } from '../../data/entities';
export class ConditionsDto {
 @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(1) threshold?:number;
 @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-1) @Max(1) delta?:number;
 @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(3650) days?:number;
 @ApiPropertyOptional({enum:EnrollmentStatus}) @IsOptional() @IsEnum(EnrollmentStatus) status?:EnrollmentStatus;
}
export class TriggerDto {
 @ApiProperty({enum:TriggerType}) @IsEnum(TriggerType) type!:TriggerType;
 @ApiProperty({type:ConditionsDto}) @ValidateNested() @Type(()=>ConditionsDto) conditions!:ConditionsDto;
}
export class ActionConfigDto {
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) templateId?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) message?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) channelId?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) campaignId?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) coachId?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) endpointKey?:string;
}
export class ActionDto {
 @ApiProperty({enum:ActionType}) @IsEnum(ActionType) type!:ActionType;
 @ApiProperty({type:ActionConfigDto}) @ValidateNested() @Type(()=>ActionConfigDto) config!:ActionConfigDto;
}
export class CreateAutomationDto {
 @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) name!:string;
 @ApiProperty({type:TriggerDto}) @ValidateNested() @Type(()=>TriggerDto) trigger!:TriggerDto;
 @ApiProperty({type:[ActionDto]}) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(()=>ActionDto) actions!:ActionDto[];
 @ApiProperty() @IsNumber() @Min(0) @Max(8760) cooldownHours!:number;
 @ApiProperty() @IsBoolean() isActive!:boolean;
}
export class UpdateAutomationDto extends PartialType(CreateAutomationDto){}

