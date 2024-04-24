import { Metadata } from "next";

// объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "About | Music Platform",
  icons: {
    icon: [
      {
        url: "/images/icon/favicon.ico",
        href: "/images/icon/favicon.ico",
      },
    ],
  },
};

export default function About() {
  return (
    <div className="about">
      <h3>About. Выбрать подпункт</h3>
    </div>
  );
}
