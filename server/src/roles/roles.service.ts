import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
// import { UpdateRoleDto } from './dto/update-role.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRolesEntity } from './entities/user-roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRolesEntity)
    private userRolesRepository: Repository<UserRolesEntity>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return role;
  }

  async getRoleByValue(value: string) {
    const role = await this.roleRepository.findOne({ where: { value } });
    return role;
  }

  // create(createRoleDto: CreateRoleDto) {
  //   return this.roleRepository.save(createRoleDto);
  // }

  // findAll() {
  //   return `This action returns all roles`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} role`;
  // }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // update(id: number, updateRoleDto: UpdateRoleDto) {
  //   return `This action updates a #${id} role`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} role`;
  // }
}
