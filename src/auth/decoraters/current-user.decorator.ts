import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlCtx = ctx.getContext();

    return gqlCtx.user || gqlCtx.req?.user || gqlCtx.connection?.context?.user || null;
  },
);
