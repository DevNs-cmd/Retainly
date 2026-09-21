import { Injectable } from '@nestjs/common'; import { UsersRepository } from './users.repository'; import { TenantContext } from '../tenant/tenant.context'; import { UpdateUserDto } from './dto/user.dto';
@Injectable() export class UsersService { constructor(private readonly repository: UsersRepository, private readonly tenant: TenantContext) {} me() { return this.repository.get(this.tenant.userId); } update(dto: UpdateUserDto) { return this.repository.update(this.tenant.userId, dto); } }

