import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    let { username, email, password } = registerUserDto;
    try {
      const username_exists = await this.findByUsername(username);

      // validate
      if (username_exists)
        throw new HttpException(`username is exists!`, HttpStatus.BAD_GATEWAY);

      const email_exists = await this.findByEmail(email);

      if (email_exists)
        throw new HttpException(`email is exists!`, HttpStatus.BAD_GATEWAY);

      // hash password
      password = await bcrypt.hash(password, 10);

      // create
      const saved = await this.usersRepository.save({
        ...registerUserDto,
        password,
      });

      this.logger.log(`register a new user by id#${saved?.id}`);

      return saved;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    //  return await this.usersRepository
    //     .createQueryBuilder()
    //     .delete()
    //     .from('user')
    //     .execute();
    return await this.usersRepository.delete(id);
  }
}
