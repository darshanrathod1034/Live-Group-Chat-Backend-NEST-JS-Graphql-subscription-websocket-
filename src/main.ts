import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const cookieParser = require('cookie-parser'); // ✅ CommonJS fix

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ✅ Should work now

  await app.listen(3000);
  console.log(`🚀 Server running at http://localhost:3000/graphql`);
}
bootstrap();

