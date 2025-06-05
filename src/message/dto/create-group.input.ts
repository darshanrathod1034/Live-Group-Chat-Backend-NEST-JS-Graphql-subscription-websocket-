// crear group chat dto
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
@InputType()
export class CreateGroupInput {
  @Field()
  @IsString()
  groupName: string;

    @Field(() => [String])
    @IsArray()
    @ArrayNotEmpty()

  groupAdmin: string[];

  @Field(() => [String])
    @IsArray()
  @ArrayNotEmpty()
  participants: string[];

  @Field({ nullable: true })
  description?: string;
}