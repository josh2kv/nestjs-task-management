import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createUser(username: string, password: string): Promise<User> {
    if (await this.isUsernameExists(username))
      throw new ConflictException('Username already exists');

    const user = this.usersRepository.create({ username, password });

    try {
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) throw new NotFoundException('Username not found');

    return user;
  }

  async isUsernameExists(username: string): Promise<boolean> {
    return (await this.usersRepository.findOne({ where: { username } }))
      ? true
      : false;
  }
}
