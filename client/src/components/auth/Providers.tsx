// поставщики. обёртка

"use client";

// поставщик обёртки.данн.сессии в приложении
import { SessionProvider } from "next-auth/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
