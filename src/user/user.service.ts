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
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(queryUserDto: QueryUserDto): Promise<User[]> {
    const { sortBy, sortType, limit, page, ...query } = queryUserDto;
    try {
      let builder: any = this.userRepository
        .createQueryBuilder()
        .leftJoinAndSelect('User.category', 'category');

      if (sortBy && sortType) builder = builder.orderBy('name', sortType);

      if (page && limit)
        builder = builder.offset((+page - 1) * +limit).limit(+limit);

      if (query.name)
        builder = builder.andWhere('user.name LIKE :name', {
          name: `%${query.name}%`,
        });

      if (query.userId)
        builder = builder.andWhere('user.id = :userId', {
          userId: query.userId,
        });

      return builder.getMany();
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    let { username, email, password } = registerUserDto;
    try {
      // validate
      const username_exists = await this.findByUsername(username);

      if (username_exists)
        throw new HttpException(`username is exists!`, HttpStatus.BAD_GATEWAY);

      const email_exists = await this.findByEmail(email);

      if (email_exists)
        throw new HttpException(`email is exists!`, HttpStatus.BAD_GATEWAY);

      // hash password
      password = await bcrypt.hash(password, 10);

      // create
      const saved = await this.userRepository.save({
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, usernameOld, emailOld, email } = updateUserDto;

    try {
      // check data
      await this.isModelExists(id);

      if (username !== usernameOld) {
        const username_exists = await this.findByUsername(
          updateUserDto.username,
        );

        if (username_exists)
          throw new HttpException(
            `username is exists!`,
            HttpStatus.BAD_GATEWAY,
          );
      }

      if (email !== emailOld) {
        const email_exists = await this.findByEmail(updateUserDto.email);

        if (email_exists)
          throw new HttpException(`email is exists!`, HttpStatus.BAD_GATEWAY);
      }

      // remove redundance schema
      delete updateUserDto.usernameOld;
      delete updateUserDto.emailOld;

      // update
      await this.userRepository
        .createQueryBuilder()
        .update('user')
        .set(updateUserDto)
        .where('id = :id', { id })
        .execute();

      this.logger.log(`update a user by id#${id}`);

      return this.findById(id);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async remove(id: number) {
    await this.isModelExists(id);

    const removed = await this.userRepository.delete(id);

    return removed;
  }

  async isModelExists(id: number, opition = false, mess = '') {
    if (!id && opition) return;
    const message = mess || `user not found by id#${id}`;
    const user = await this.findById(id);
    if (!user) throw new HttpException(message, HttpStatus.NOT_FOUND);
    return user;
  }
}
