import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  username: string; 

  @Field()
  email: string;

  @Field()
  password: string;
}

// custom anotation
// 