import { Module } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
@Module({ providers: [CoursesRepository, CoursesService], controllers: [CoursesController], exports: [CoursesService] })
export class CoursesModule {}

