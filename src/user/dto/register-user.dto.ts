import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  Length,
  IsEmail,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
