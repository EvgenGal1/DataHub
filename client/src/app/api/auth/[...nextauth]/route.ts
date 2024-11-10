// api динам.роуты аутентиф.

import NextAuth from "next-auth";

// подкл.конфиг.auth
import { authConfig } from "@/configs/auth/auth";

// обработка fn NextAuth по созд.конфиг.
const handler = NextAuth(authConfig);

// возвращ.переимен.мтд.
export { handler as GET, handler as POST };
