
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PubSub } from 'graphql-subscriptions';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
//import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    //    PubSubModule
  ],
  providers: [
    MessageResolver,
    MessageService,
    
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(), // Import from 'graphql-subscriptions'
    },
  ],
  exports: [MessageService],
})
export class MessageModule {}