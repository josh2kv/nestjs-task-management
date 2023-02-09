import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.usersService.create(authCredentialsDto);
  }
}
