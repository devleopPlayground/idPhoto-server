import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getUsers() {
    return await this.usersRepository.find();
  }

  async createUser(user: Pick<UsersModel, 'email' | 'password' | 'username'>) {
    const existsUsername = await this.usersRepository.exists({
      where: {
        username: user.username,
      },
    });

    if (existsUsername) {
      throw new BadRequestException('이미 존재하는 유저의 이름 입니다.');
    }

    const existsEmail = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (existsEmail) {
      throw new BadRequestException('이미 등록된 이메일 주소 입니다.');
    }

    const newUser = this.usersRepository.create({
      email: user.email,
      password: user.password,
      username: user.username,
    });

    return await this.usersRepository.save(newUser);
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }
}
