import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { CustomHttpException } from './http-exceptions.type';
import { AxiosError } from 'axios';
import { TraceService } from '~src/telemetry/trace/trace.service';
import { StringUtils } from '~src/utils/string.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly traceService: TraceService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const span = this.traceService.getSpan();

    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response<unknown, Record<string, unknown>> = ctx.getResponse<Response>();
    const status: number = getStatusCode(exception);
    const message: string | object = getMessage(exception);
    const code: string | null = getErrorCode(exception);
    const externalError = getExternalError(exception);

    const req = ctx.getRequest();

    const rsBody = {
      _error: {
        code: code || status,
        text: message,
        details: {
          time: new Date(),
          method: req.method,
          url: `${req.protocol}://${req.hostname}${req.originalUrl}`,
          definition_name: null,
          stack: (exception as Error)?.stack ?? null,
          external_error: externalError,
          ...(req.x_request_id ? { x_request_id: req.x_request_id } : {})
        }
      }
    };
    this.traceService.traceIncomingResponse(
      {
        code: response.statusCode,
        'x-request-id': StringUtils.toString(response.getHeader('x-request-id')),
        headers: response.getHeaders(),
        body: rsBody
      },
      span
    );
    this.traceService.recordException(exception as Error, span);
    span.end();

    response.status(status).json(rsBody);
  }
}

function getStatusCode(exception: unknown): number {
  if (exception instanceof BadRequestException) {
    return HttpStatus.BAD_REQUEST;
  }

  // Если ошибку прокинули из нашего сервиса
  if (exception instanceof CustomHttpException) {
    return exception.getStatus();
  }

  // Если внешний сервис вернул ошибку
  if (isExternalError(exception)) {
    return HttpStatus.BAD_GATEWAY;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function getErrorCode(exception: unknown): string | null {
  if (exception instanceof CustomHttpException) {
    return exception.getErrorCode() || null;
  }

  if (isExternalError(exception)) {
    return 'CPH-ERR';
  }

  return null;
}

function getMessage(exception: unknown): string | object {
  if (exception instanceof HttpException) {
    const rsMsg: string | object = exception.getResponse();

    if (rsMsg instanceof CustomHttpException && rsMsg.message) {
      return rsMsg.message;
    }

    if (exception instanceof BadRequestException && exception.message) {
      return [exception.message];
    }

    return rsMsg;
  }

  return 'Произошла непредвиденная ошибка';
}

function getExternalError(error: unknown): unknown {
  if ((error as unknown) instanceof AxiosError) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }

  return null;
}

function isExternalError(error: unknown): boolean {
  return error instanceof AxiosError;
}
