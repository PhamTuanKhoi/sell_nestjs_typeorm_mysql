import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { Auth } from './decorator/auth.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtPayload } from './interface/jwtPayload.interface';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@Auth() auth: JwtPayload) {
    return this.authService.getUserFromJwtPayload(auth);
  }
}
