import { ConsoleLogger, Global, Logger, LogLevel, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: Logger,
      useFactory: (config: ConfigService) => {
        const prodLogLevel = config
          .getOrThrow<string>('service.logging.prod')
          .split(',') as LogLevel[];
        const devLogLevel = config
          .getOrThrow<string>('service.logging.dev')
          .split(',') as LogLevel[];
        const isProd = 'production' === config.get('app.profile');

        return new ConsoleLogger({
          logLevels: isProd ? prodLogLevel : devLogLevel,
          json: config.get('app.is-stend')
        });
      }
    }
  ],
  exports: [Logger]
})
export class LoggingModule {}
