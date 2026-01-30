import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './auth/public.decorator'

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Public()
  @Post('auth/login')
  async login(@Request() req) {
    console.log('login')
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }  
}
