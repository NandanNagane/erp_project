import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, skip, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const requestUrl = req.originalUrl;
    const headers = req.rawHeaders;
    // const reqType=req.query
    // console.log(reqType)

    // if (
    //   method === 'POST' ||
    //   method === 'GET' ||
    //   method === 'PUT' ||
    //   method === 'DELETE'
    // ) {
    //   if (headers.indexOf('x-api-key') != -1) {
    //     // console.log(headers)
    //   } else {
    //     return next.handle().pipe(
    //       map(
    //         (data) =>
    //           (data = {
    //             success: 0,
    //             message: 'You are not blocked',
    //           }),
    //       ),
    //     );
    //   }
    // }
    map((data) => {
    if (method === 'GET' && req.query.skip === 'true') {
  return {
    message: 'Blocked by interceptor',
  };
}
    });

    return next.handle().pipe(
      // map((data) => {
      //   if (method === 'GET' && requestUrl.includes('users-list?block=true')) {
      //     data = {
      //       message: 'Blocked by interceptor',
      //     };
      //     return data;
      //   }
      //   if (
      //     method === 'POST' ||
      //     method === 'GET' ||
      //     method === 'PUT' ||
      //     method === 'DELETE'
      //   ) {
      //     if (!data?.settings) {
      //       return data;
      //     }

      //     const incoming = data.settings.incoming_data;
      //     const insertId = data.settings.data?.insert_id;

      //     if (!incoming) {
      //       return data;
      //     }

      //     const product = {
      //       ...incoming,
      //       id: insertId,
      //       addedBy: 1,
      //     };

      //     return {
      //       settings: {
      //         data: {
      //           list: [product],
      //         },
      //       },
      //     };
      //   }

      //   return data;
      // }),
    );
  }
}
