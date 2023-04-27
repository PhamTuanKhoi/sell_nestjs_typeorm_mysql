import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  usernameOld: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  emailOld: string;
}
