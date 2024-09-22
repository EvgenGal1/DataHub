// промежуточное программное обеспечение

export { default } from "next-auth/middleware";

export const config = {
  // сопоставитель разрешённых приватных роутов
  matcher: ["/profile", "/protected/:path*"],
};
