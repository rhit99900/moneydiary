import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/utils/decorators.meta';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('/signin')
  signIn(@Body() signInDTO: Record<string, any>) {
    return this.authService.signIn(signInDTO.username, signInDTO.password)
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getProfile(@Request() request) {
    return request.user;
  }

}
