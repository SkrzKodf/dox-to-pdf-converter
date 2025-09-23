import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { context, Span, trace } from '@opentelemetry/api';
import { EVENTS, TRACERS } from '~src/telemetry/trace/const/const';
import { TraceService } from '~src/telemetry/trace/trace.service';
import requestTracer from '~src/telemetry/tracer/request.tracer';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly traceService: TraceService) {}

  intercept(exContext: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = exContext.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const startTime = Date.now();

    const httpSpan = this.traceService.getSpan();
    this.traceService.saveHttpSpan(headers['x-request-id'], httpSpan);
    requestTracer(this.traceService, {
      ...request,
      'x-request-id': request.headers['x-request-id']
    });

    return this.traceService
      .getTracer(TRACERS.CONTROLLER)
      .startActiveSpan(`Controller ${method} ${url}`, (span: Span) => {
        span.setAttribute('http.method', method);
        span.setAttribute('http.url', url);

        span.setAttribute('x-request-id', headers['x-request-id']);

        trace.setSpan(context.active(), span);

        return next.handle().pipe(
          tap({
            next: () => {
              span.setAttribute('http.status_code', 200);
              if (httpSpan) {
                this.traceService.event(
                  EVENTS.HTTP_INCOMING_RESPONSE,
                  { 'http.body': 'file' },
                  httpSpan
                );
              }
              this.traceService.event(EVENTS.CONTROLLER_RESULT, { result: 'file' }, span);
            },
            error: (err) => {
              this.traceService.recordException(err, span);
              span.setAttribute('http.status_code', err.status || 500);
            },
            finalize: () => {
              const duration = Date.now() - startTime;
              span.setAttribute('http.duration_ms', duration);
              span.end();
            }
          })
        );
      });
  }
}
