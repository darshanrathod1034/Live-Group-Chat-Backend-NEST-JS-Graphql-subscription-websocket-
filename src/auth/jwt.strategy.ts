import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { cookieOrWsExtractor } from './jwt-extractor'; // adjust path

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {
    super({
      jwtFromRequest: cookieOrWsExtractor,
      ignoreExpiration: false,
      secretOrKey: 'darshan',
    });
  }

  async validate(payload: any): Promise<UserDocument> {
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
