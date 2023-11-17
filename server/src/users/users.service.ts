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
    private userRepository: Repository<UserEntity>,
  ) {}

  // СОЗД
  async create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async findAll() {
    return this.userRepository.find(); // findAndCount
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // получ.user по email
  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  // получ.user по id
  async findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateUserDto: UpdateUserDto) {
    return `Это действие обновляет пользователя с #${id}`;
  }

  async remove(id: number) {
    return `Это действие удаляет пользователя с #${id}`;
  }
}
