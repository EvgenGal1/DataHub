import { Metadata } from "next";

// объ.настр.метадаты > SEO
export const metadata: Metadata = {
  title: "About | Music Platform",
};

export default function About() {
  return (
    <div className="about block text-center">
      <h3>About. Выбрать подпункт</h3>
    </div>
  );
}
