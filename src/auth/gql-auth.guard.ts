import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlCtx = ctx.getContext();

    // HTTP requests
    if (gqlCtx.req) {
      return gqlCtx.req;
    }

    // WebSocket connection
    return {
      headers: gqlCtx.connection?.context || {},
    };
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    // Attach user to GraphQL context for @CurrentUser() decorator
    const gqlContext = GqlExecutionContext.create(context).getContext();
    gqlContext.user = user;

    return user;
  }
}
