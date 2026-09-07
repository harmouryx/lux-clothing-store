import { redirect } from "next/navigation";
import i18nConfig from "@/i18nConfig";

export default function RootPage() {
  redirect(`/${i18nConfig.defaultLocale || "en"}`);
}