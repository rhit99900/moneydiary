import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/data/prisma.service';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async user(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: filter
    })
  }

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username: username
      }
    });
  }
}
