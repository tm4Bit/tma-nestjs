import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getEnv } from 'src/config/env';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const env = getEnv();
        const secret = env.JWT_SECRET;
        const expiresIn = env.JWT_EXPIRES_IN;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
