import { Module } from '@nestjs/common';
import { ConfigModule } from '~src/common/modules/config/config.module';
import { LoggingModule } from '~src/common/modules/logging/logging.module';
import { TraceModule } from '~src/telemetry/trace/trace.module';
import { HttpModule } from '~src/http/http.module';
import { YamlConfigModule } from '@followtheowlets/yaml-conf';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    YamlConfigModule.forRoot({ filePath: 'config' }),
    MulterModule.register(),
    ConfigModule,
    LoggingModule,
    TraceModule,
    HttpModule
  ]
})
export class AppModule {}
