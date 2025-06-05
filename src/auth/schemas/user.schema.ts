// src/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true,}) // Never return password in queries
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  sentMessages: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  receivedMessages: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Conversation' }], default: [] })
  conversations: Types.ObjectId[];

  // Virtual getter to convert _id to id
  get id(): Types.ObjectId {
    return (this as any)._id;
  }
}

export type UserDocument = User & Document & {
  _id: Types.ObjectId;
  id: Types.ObjectId; // Expose id getter in the type
};
export const UserSchema = SchemaFactory.createForClass(User);

// Add virtuals to ensure proper serialization
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});