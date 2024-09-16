// конфиг.авторизации/аутентификации

import type { AuthOptions } from "next-auth";
import GoggleProvider from "next-auth/providers/google";

export const authConfig: AuthOptions = {
  // провайдеры(обязат.парам.)
  providers: [
    // провайдер гугл.вызова fn с настр.ID и SECRET ч/з Google Cloud Console APLs&Services OAuth
    GoggleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
};
