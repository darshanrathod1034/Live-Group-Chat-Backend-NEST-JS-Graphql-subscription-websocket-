// app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nestjs-auth'),

    JwtModule.register({
      secret: 'darshan',
      signOptions: { expiresIn: '1d' },
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule],
      inject: [JwtService],
      useFactory: (jwtService: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        installSubscriptionHandlers: true,

        subscriptions: {
          'subscriptions-transport-ws': {
            path: '/graphql',
            onConnect: async (connectionParams: any) => {
              console.log('Connection params:', connectionParams);
                console.log('Full connectionParams:', JSON.stringify(connectionParams, null, 2));
              const authHeader = connectionParams?.Authorization || connectionParams?.authorization;
              //const token = authHeader?.split(' ')[1];
              const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODM4NDMzNzAyMzMzMDI0YWI3ZDYzZDgiLCJlbWFpbCI6InJhdGhvZDFAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDg5NjY0NjMsImV4cCI6MTc0ODk3MDA2M30.vbvT9ll82UjtI1xe2W7e7WSzeIeJoDJGJBaitEsgPfI";

              console.log('Token from connectionParams:', token);
              if (!token) throw new Error('Missing auth token so add Authorization header');
              
              try {
                const user = await jwtService.verifyAsync(token, {
                  secret: 'darshan',
                });
                return { user };
              } catch (err) {
                console.error('Invalid token:', err.message);
                throw new Error('Invalid token');
              }
            },
          },
        },

        context: ({ req, res, connection }) => {
  if (connection) {
    return {
      req: {
        headers: connection.context,
      },
      user: connection.context.user,
    };
  }

  return {
    req,
    res,
    user: req.user,
  };
},

        csrfPrevention: false,

        playground: {
          settings: {
            'request.credentials': 'include',
          },
        },

        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
        },
      }),
    }),

    AuthModule,
    MessageModule,
  ],
})
export class AppModule {}
