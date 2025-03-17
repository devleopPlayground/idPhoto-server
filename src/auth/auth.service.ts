/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  createToken(
    user: Pick<UsersModel, 'id' | 'email' | 'username'>,
    isRefresh: boolean = false,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      type: isRefresh ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('SECRET'),
      expiresIn: isRefresh ? 3600 : 300,
    });
  }

  getToken(user: Pick<UsersModel, 'id' | 'email' | 'username'>) {
    return {
      accessToken: this.createToken(user),
      refreshToken: this.createToken(user, true),
    };
  }

  async registerUser(
    user: Pick<UsersModel, 'email' | 'password' | 'username'>,
  ) {
    const hashed = await bcrypt.hash(user.password, 8);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hashed,
    });

    return this.getToken(newUser);
  }

  async loginUser(user: Pick<UsersModel, 'email' | 'password'>) {
    const foundUser = await this.usersService.getUserByEmail(user.email);

    if (!foundUser) {
      throw new UnauthorizedException('존재하지 않는 유저입니다.');
    }

    const password = await bcrypt.compare(user.password, foundUser.password);

    if (!password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return this.getToken(foundUser);
  }

  getAccessAndRefreshToken(token: string, isRefreshToken: boolean) {
    const authToken = token.split(' ');

    if (authToken.length !== 2 || authToken[0] !== 'Bearer') {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }

    const payload = this.jwtService.verify(authToken[1], {
      secret: this.configService.get('SECRET'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('refresh token만 사용가능합니다.');
    }

    return this.createToken(payload, isRefreshToken);
  }
}
