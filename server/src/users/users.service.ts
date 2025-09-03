import { Injectable } from '@nestjs/common';

export type User = {
  user_id: number;
  username: string;
  password: string;
}

@Injectable()
export class UsersService {
  private readonly users: Array<User> = [
    {
      user_id: 1,
      username: 'john',
      password: 'password'
    }, {
      user_id: 2,
      username: 'doe',
      password: 'passwords'
    }
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
