import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.dto';
import { Response } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  healthCheck(): string {
    return 'GraphQL API is working';
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    const result = await this.authService.register(input);

    context.res.cookie('token', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // set true in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return result;
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    const result = await this.authService.login(input);

    context.res.cookie('token', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // set true in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return result;
  }
}
