import { setRequestLocale } from "next-intl/server";
import HomePageContent from "./HomePageContent";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);

  return <HomePageContent />;
}
