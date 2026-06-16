import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from 'src/auth/dto/login.dto';
import { Public } from 'src/packages/decorators/public-decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: loginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    // Expect "Bearer <refreshToken>" from the Next.js Route Handler
    const token = authHeader?.replace('Bearer ', '') || '';
    return this.authService.refresh(token);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }
}
