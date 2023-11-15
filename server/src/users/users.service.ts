// логика(бизнес,)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  // ч/з внедр.завис. + UserEntity > раб.ч/з this с табл.users
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  // СОЗД
  async create(createUserDto: CreateUserDto) {
    return this.repository.save(createUserDto);
  }

  async findAll() {
    return this.repository.find(); // findAndCount
  }

  async findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  // получ.user по email
  async findByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }

  // получ.user по id
  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
