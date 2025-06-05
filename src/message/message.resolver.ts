import {
  Resolver,
  Args,
  Subscription,
  Query,
  Mutation,
  Context,
} from '@nestjs/graphql';
import {
  Inject,
  Logger,
  UseGuards,
  Injectable,
} from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UserDocument } from '../auth/schemas/user.schema';
import { MessageService } from './message.service';
import { SendMessageInput } from './dto/send-message.input';
import { CurrentUser } from '../auth/decoraters/current-user.decorator';
import { MessageModel } from './dto/message.model';
import { CreateGroupInput } from './dto/create-group.input';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
@Resolver(() => MessageModel)
export class MessageResolver {
  private readonly logger = new Logger(MessageResolver.name);

  constructor(
    @Inject('PUB_SUB') private readonly pubSub: PubSubEngine,
    private readonly messageService: MessageService,
  ) {}

  @Subscription(() => MessageModel, {
  filter: async function (this: MessageResolver, payload, variables, context) {
    const userId = context?.user?._id || context?.req?.user?._id;

    if (!userId) {
      this.logger.warn('User not found in context');
      return false;
    }

    try {
      return await this.messageService.validateUserInConversation(
        userId.toString(),
        variables.conversationId,
      );
    } catch (error) {
      this.logger.error('Error in subscription validation', error);
      return false;
    }
  },
  resolve: (payload) => payload.messageAdded,
})

  @UseGuards(GqlAuthGuard)
  messageAdded(@Args('conversationId') conversationId: string) {
    return (this.pubSub as any).asyncIterator('MESSAGE_ADDED');
  }

  @Mutation(() => MessageModel)
  @UseGuards(GqlAuthGuard)
  
  async sendMessage(
    @Args('content') content: string,
    @Args('conversationId') conversationId: string,
    @CurrentUser() user: UserDocument,
  ) {
   // console.log('Received conversationId:', conversationId);

    try {
      if (!user || !user._id) {
        throw new Error('Unauthorized: user not found');
      }

      const senderId = user._id.toString();

      //Pass conversationId
      const newMessage = await this.messageService.createMessage({
        content,
        sender: senderId,
        conversation: conversationId,
      });

      
      await this.pubSub.publish('MESSAGE_ADDED', {
        messageAdded: newMessage,
      });

      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  @Query(() => [MessageModel])
  @UseGuards(GqlAuthGuard)
  async getMessages(
  @Args('conversationId') conversationId: string,
  @CurrentUser() user: UserDocument,
): Promise<MessageModel[]> {
  try {
    await this.messageService.validateUserInConversation(
      user.id.toString(),
      conversationId,
    );

    const messages = await this.messageService.getMessages(conversationId);

    return messages.map((msg) => {
      const obj = msg.toObject();

      // Convert populated sender and recipient to string IDs
      obj.sender = obj.sender?._id?.toString() || obj.sender.toString();
      obj.recipient = obj.recipient?._id?.toString() || obj.recipient?.toString();

      return obj;
    });
  } catch (error) {
    this.logger.error(
      `Failed to fetch messages for user ${user.id}: ${error.message}`,
      error.stack,
    );
    throw new Error('Failed to fetch messages');
  }
}

/*@Mutation(() => MessageModel)
@UseGuards(AuthGuard)
async createGroupMessage(
  @Args('input') input: CreateGroupInput,
  @CurrentUser() user: UserDocument,  
): Promise<MessageModel> {
  // Validate the user is authenticated
  const senderId = user._id.toString();

  // Create the group 
  const conversation = await this.messageService.createGroup({
    ...input,
    senderId,
  });
  // return the conversation
  const message = await this.messageService.create({
    content: "group created successfully",
    
    senderId,
    conversationId: conversation._id.toString(),
  });



  const msgObj = message.toObject ? message.toObject() : message;
  return {
    ...msgObj,
    createdAt: msgObj.createdAt,
    updatedAt: msgObj.updatedAt,
  };
}*/

}
