import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { JwtPayload } from './interface/jwtPayload';
import { Http2ServerRequest } from 'http2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user)
      throw new HttpException(`username incorrect!`, HttpStatus.BAD_GATEWAY);

    const match = await bcrypt.compare(pass, user?.password);

    if (!match)
      throw new HttpException(`password incorrect!`, HttpStatus.BAD_GATEWAY);

    if (user && match) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login({ username }: LoginUserDto) {
    const user = await this.userService.findByUsername(username);

    if (!user)
      throw new HttpException(`username incorrect!`, HttpStatus.BAD_GATEWAY);

    const payload = { username: user.username, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  async getUserFromJwtPayload({ id }: JwtPayload) {
    const user = await this.userService.findOne(id);
    if (!user) throw new HttpException(`user not found`, HttpStatus.NOT_FOUND);
    return user;
  }
}
