// объедин.metadata для разных языков
import metadataRu from "@/config/lang/locales/ru";
import metadataEn from "@/config/lang/locales/en";

type Language = "ru" | "en";

const metadatalang: Record<
  Language,
  { title: string; description: string; keywords: string }
> = {
  ru: metadataRu,
  en: metadataEn,
};

export default metadatalang;
