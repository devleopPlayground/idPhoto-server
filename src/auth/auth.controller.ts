import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
