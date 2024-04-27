// отд.ф.декоратор для загрузки user.id
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// fn для созд.декор. >> вытаскиваем запрос >> вытаск. id usera
export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number | null => {
    const request = context.switchToHttp().getRequest();
    return request.user?.id
      ? Number(request.user.id)
      : /* // !! врем.1,а !=null */
        1;
  },
);
