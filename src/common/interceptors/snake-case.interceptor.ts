import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

const toSnakeCase = (value: string): string =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const transformKeys = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map((item) => transformKeys(item));
  }

  if (input && typeof input === 'object') {
    return Object.entries(input).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        const normalizedKey = key.includes('_') ? key : toSnakeCase(key);
        acc[normalizedKey] = transformKeys(value);
        return acc;
      },
      {},
    );
  }

  return input;
};

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => transformKeys(data)));
  }
}
