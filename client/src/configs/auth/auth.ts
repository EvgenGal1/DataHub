// конфиг.авторизации/аутентификации

import type { AuthOptions, User } from "next-auth";
import GoggleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// фейк данн.Пользователей
import { usersFake } from "@/data/usersFake";

export const authConfig: AuthOptions = {
  // провайдеры(обязат.парам.). Здесь google/форма/кастом (их МНОГО)
  providers: [
    // fn гугл.вход
    GoggleProvider({
      // настр.ID и SECRET ч/з Google Cloud Console OAuth APLs&Services
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    // `Реквизиты для входа`. fn вход ч/з форму по логин/пароль
    Credentials({
      // поля eml/psw с указ.:обводки,типа,обязат.
      credentials: {
        email: { label: "email", type: "email", required: true },
        password: { label: "password", type: "password", required: true },
      },
      // async мтд.объ.с приёмом реквизитов входа
      async authorize(credentials) {
        // проверки отсутствия eml/psw
        if (!credentials?.email || !credentials.password) return null;

        // ^^ req/res получ.данн.с БД

        // фейк данн.польз.(только > next). перебор
        const currentUser = usersFake.find(
          (userFake) => userFake.email === credentials.email
        );
        // фейк данн.польз. соответ.ведённым данн.
        if (currentUser && currentUser.password === credentials.password) {
          const { password, ...userWithoutPass } = currentUser;
          // возвращ.user под опред.типом без psw
          console.log("userWithoutPass : ", userWithoutPass);
          return userWithoutPass as User;
        }
        // null е/и не авториз.
        return null;
      },
    }),
  ],
  // кастомн.стр.(редирект)
  pages: {
    signIn: "/signin",
  },
};
