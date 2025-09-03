import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWT_CONSTANTS } from "./constants";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "src/utils/decorators.meta";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private JWT: JwtService,
    private reflector: Reflector
  ){}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if(isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    if(!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.JWT.verifyAsync(token, {
        secret: JWT_CONSTANTS.SECRET
      });      
      request['user'] = payload;
    } catch(e) {
      console.log(e);
      throw new UnauthorizedException();
    }
    return true;
  }

  private getToken(request: Request): string | undefined {
    const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}