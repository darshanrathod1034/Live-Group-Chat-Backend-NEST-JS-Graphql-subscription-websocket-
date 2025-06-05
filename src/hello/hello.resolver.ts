import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HelloResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello from GraphQL!';
  }
}
