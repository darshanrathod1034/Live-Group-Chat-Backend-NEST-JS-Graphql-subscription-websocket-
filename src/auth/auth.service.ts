import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { username,email, password } = input;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = this.jwtService.sign({ sub: newUser._id, email });

    return { accessToken:token ,user: { id: newUser.id, email:newUser.email, username:newUser.username } };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;
  console.log('LOGIN INPUT:', input);  // ✅ add this
  const user = await this.userModel.findOne({ email });
  console.log('USER FROM DB:', user);  // ✅ and this
  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)   throw new UnauthorizedException('Invalid credentials');

  const token = this.jwtService.sign({ sub: user._id, email });
  return {
    accessToken: token,
    user: { id: user.id, email: user.email, username: user.username },
  };
}
}
