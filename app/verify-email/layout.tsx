import { pageTitle } from "@/app/i18n/server";

export const generateMetadata = pageTitle("verifyEmail");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
