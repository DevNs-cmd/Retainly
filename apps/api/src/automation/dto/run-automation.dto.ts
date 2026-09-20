import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RunAutomationDto { @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) studentId!:string; }
