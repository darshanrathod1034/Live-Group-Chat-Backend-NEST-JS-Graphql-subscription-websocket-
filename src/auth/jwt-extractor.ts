import { ExtractJwt } from 'passport-jwt';

export const cookieOrWsExtractor = (req: any): string | null => {
  if (req?.headers?.authorization) {
    // For WebSocket subscriptions and HTTP requests
    return req.headers.authorization.split(' ')[1];
  }

  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
