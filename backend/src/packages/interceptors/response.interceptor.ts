// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'success' in result) {
          return result;
        }

        console.log(result);

        return {
          success: true,
          message: result?.message ?? 'Request successful',
          data: result?.data ?? result?.data.data ?? null,
          meta: result?.meta ?? null,
        };
      }),
    );
  }
}
