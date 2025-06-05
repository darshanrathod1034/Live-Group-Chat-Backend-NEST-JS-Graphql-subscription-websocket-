// src/message/dto/message.model.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from '../schemas/message.schema'; 

import { Types } from 'mongoose';

@ObjectType()
export class MessageModel {
  @Field(() => ID)
  _id: string;

  @Field()
  content: string;

  @Field(() => ID)
  conversation: string;

  @Field(() => ID)
  sender: string;

  @Field(() => ID, { nullable: true })
  recipient?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
