import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { SendMessageInput } from './dto/send-message.input';
//import { CreateGroupInput } from './dto/create-group.input';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    
  ) {}

  async createMessage(data: { content: string; sender: string; conversation: string }): Promise<MessageDocument> {
    const message = new this.messageModel(data);
    return message.save();
  }

  async validateUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const conversation = await this.conversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: userId,
    });

    if (!conversation) {
      throw new ForbiddenException('User not part of this conversation');
    }

    return true;
  }

  async create(input: SendMessageInput & { senderId: string }): Promise<MessageDocument> {
    let conversation = await this.conversationModel.findById(input.conversationId);

    if (!conversation && input.recipientId) {
      conversation = await this.conversationModel.create({
        participants: [
          new Types.ObjectId(input.senderId),
          new Types.ObjectId(input.recipientId),
        ],
      });
    }

    if (!conversation) {
      throw new Error('Conversation not found or could not be created.');
    }

    const message = await this.messageModel.create({
      content: input.content,
      sender: new Types.ObjectId(input.senderId),
      recipient: input.recipientId ? new Types.ObjectId(input.recipientId) : undefined,
      conversation: conversation._id,
    });

    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      $push: { messages: message._id },
      $set: { updatedAt: new Date() },
    });

    
    await message.populate('sender', 'username');

    return message;
  }

  /*async createGroup(input: CreateGroupInput & { senderId: string }): Promise<ConversationDocument> {
    const participants = input.participants.map(id => new Types.ObjectId(id));
    participants.push(new Types.ObjectId(input.senderId));
    if (participants.length < 2) {
      throw new BadRequestException('At least two participants are required to create a group.');
    }
    const admins = input.groupAdmin.map(id => new Types.ObjectId(id))  ;
    admins.push(new Types.ObjectId(input.senderId));
    if (admins.length < 1) {  
      throw new BadRequestException('At least one group admin is required.');
    }


    const conversation = await this.conversationModel.create({
      participants,
      groupAdmin: admins,
      //groupAdmin: [new Types.ObjectId(input.senderId)],
    });

    return conversation;
  }*/

  async getMessages(conversationId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ conversation: conversationId })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: 1 })
      .exec();
  }
}
