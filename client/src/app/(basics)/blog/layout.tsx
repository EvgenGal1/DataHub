import { Metadata } from "next";

// общ.объ.настр.метадаты > SEO
export const metadata: Metadata = { title: "Data Hub | Blog" };

export default function Bloglayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
