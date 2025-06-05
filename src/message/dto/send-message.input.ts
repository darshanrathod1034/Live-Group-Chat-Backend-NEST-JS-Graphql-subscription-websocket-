// src/messages/dto/send-message.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  conversationId: string;
}