// отд.ф.декоратор для загрузки user.id
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// fn для созд.декор. >> вытаскиваем запрос >> вытаск. id usera
export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): number | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id ? Number(request.user.id) : null;
  },
);
