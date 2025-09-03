import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthSignInResponse } from 'src/utils/types/user.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private users: UsersService,
    private JWT: JwtService
  ) {}

  async signIn(user_name: string, user_pass: string): Promise<AuthSignInResponse> {
    const user = await this.users.findOne(user_name);
    if(user?.password !== user_pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    const payload = { sub: user.user_id, username: user.username };
    const token = await this.JWT.signAsync(payload);
    return { ...result, access_token: token };
  }
}
