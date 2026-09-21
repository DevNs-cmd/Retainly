import { StudentImportService } from './student-import.service';
import { Module } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
@Module({ providers: [StudentImportService,StudentsRepository, StudentsService], controllers: [StudentsController], exports: [StudentImportService,StudentsService] })
export class StudentsModule {}


