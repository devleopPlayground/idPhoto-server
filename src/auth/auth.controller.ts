/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginUser({ email, password });
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('username') username: string,
  ) {
    return this.authService.registerUser({ email, password, username });
  }

  @Post('reissue/accessToken')
  reissueAccessToken(@Headers('authorization') token: string) {
    const accessToken = this.authService.getAccessAndRefreshToken(token, false);

    return { accessToken };
  }

  @Post('reissue/refreshToken')
  reissueRefreshToken(@Headers('authorization') token: string) {
    const refreshToken = this.authService.getAccessAndRefreshToken(token, true);

    return { refreshToken };
  }

  @Post('verity/accessToken')
  verifyAccessToken(@Headers('authorization') token: string) {
    this.authService.verifyAccessAndRefreshToken(token);

    return { message: '유효한 AccessToken입니다.' };
  }

  @Post('verity/refreshToken')
  verifyRefreshToken(@Headers('authorization') token: string) {
    this.authService.verifyAccessAndRefreshToken(token);

    return { message: '유효한 RefreshToken입니다.' };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Response() res) {
    const { user, accessToken, refreshToken } = req.user;

    await this.authService.validateGoogleUser(user);

    return res.redirect(
      `http://localhost:3000/googleLogin/token?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
