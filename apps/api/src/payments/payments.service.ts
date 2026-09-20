import { Injectable } from '@nestjs/common';import { PaymentsRepository } from './payments.repository';import { ResourceQueryDto } from '../common/dto/resource-query.dto';
@Injectable()export class PaymentsService{constructor(private readonly repository:PaymentsRepository){}list(q:ResourceQueryDto){return this.repository.list(q,q.studentId?{studentId:q.studentId}:{});}get(id:string){return this.repository.get(id);}}

