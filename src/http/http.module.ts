import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '~src/http/filter/http-exception.filter';
import { TracingInterceptor } from '~src/http/interceptors/tracing.interceptor';
import { XRequestMiddleware } from '~src/http/middleware/x-request.middleware';
import { RequestLogMiddleware } from '~src/http/middleware/request-log.middleware';
import { ConvertHttpModule } from './modules/convert-http/convert-http.module';

@Module({
  imports: [CacheModule.register(), ConvertHttpModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor
    }
  ]
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    return consumer
      .apply(XRequestMiddleware)
      .forRoutes('*')
      .apply(RequestLogMiddleware)
      .forRoutes('*');
  }
}
